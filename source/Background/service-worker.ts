import browser, {Cookies, Tabs} from 'webextension-polyfill';

import {
  Domain,
  extractDomain,
  extractOrgSlug,
  isProdDomain,
  isProdOrigin,
  orgSlugToOrigin,
  Origin,
} from './domains';
import {findOpenDevUITabs, findOpenProdTabs, tabsToOrigins} from './tabs';
import {getCookiesByOrigin, isKnownCookie, setTargetCookie} from './cookies';
import Storage from './storage';
import toUrl from '../utils/toUrl';
import uniq from '../utils/uniq';
import uniqBy from '../utils/uniqBy';

import type {Message, StorageClearResponse, SyncNowResponse} from '../types';

function debugResults(
  event: string,
  results: PromiseSettledResult<
    | {
        origin: string;
        cookie: browser.Cookies.Cookie;
      }
    | undefined
  >[]
) {
  console.log(event);
  console.table(
    results.map((result) => {
      const value = result.status === 'fulfilled' ? result.value : result;
      return {
        status: result.status,
        reason: null,
        ...value,
      };
    })
  );
}

/**
 * Look at a list of our open tabs and save a list of found org-slugs for later.
 */
async function saveFoundOrgs(origins: Origin[]): Promise<void> {
  const orgSlugs = uniq(origins.map(extractOrgSlug).filter(Boolean));
  console.log('saveFoundOrgs', {origins, orgSlugs});
  return Storage.saveOrg(orgSlugs);
}

/**
 * Look at a list of open `*.sentry.io` tabs, grab the cookies from them and
 * save them for later.
 */
async function saveProdCookies(prodOrigins: Origin[]): Promise<void> {
  // The cookies are the same on `foo.sentry.io` and `bar.sentry.io`, they're
  // set against `.sentry.io`. So we only need to ask for each unique host.
  const uniqOrigins = uniqBy(prodOrigins, extractDomain);
  const prodCookiesByOrigin = await getCookiesByOrigin(uniqOrigins);

  // Insert those cookies into storage so we can use them even if the prod tabs
  // get closed and we can't read them fresh again.
  const cookieCache = await Storage.getCookieCache();
  console.group('saveProdCookies');
  console.log('saving cookies...', {
    prodOrigins,
    uniqOrigins,
    prodCookiesByOrigin,
    cookieCache: cookieCache.toArray(),
  });
  Array.from(prodCookiesByOrigin.entries()).flatMap(([origin, cookies]) =>
    cookies.forEach((cookie) => {
      const domain = extractDomain(origin);
      if (domain) {
        cookieCache.insert(domain, cookie);
        console.log('inserted', {origin, domain, cookie});
      }
    })
  );
  console.groupEnd();
  return cookieCache.save();
}

/**
 * Read open tabs and save the orgs and cookies that we find
 */
async function findAndCacheData(): Promise<[void, void]> {
  console.group('findAndCacheData');
  const [openDevTabs, openProdTabs] = await Promise.all([
    findOpenDevUITabs(),
    findOpenProdTabs(),
  ]);
  console.log('found tabs', {openDevTabs, openProdTabs});

  const results = await Promise.all([
    saveFoundOrgs(tabsToOrigins([...openDevTabs, ...openProdTabs])),
    saveProdCookies(tabsToOrigins(openProdTabs)),
  ]);
  console.groupEnd();
  return results;
}

async function setCookiesOnKnownOrgs(): Promise<
  PromiseSettledResult<
    | {
        origin: string;
        cookie: browser.Cookies.Cookie;
      }
    | undefined
  >[]
> {
  console.group('setCookiesOnKnownOrgs');
  const [knownOrgSlugs, targetDomains, cookieCache] = await Promise.all([
    Storage.getOrgs(),
    Storage.getDomains(),
    Storage.getCookieCache(),
  ]);

  const targetOrigins = knownOrgSlugs.flatMap((orgSlug) =>
    targetDomains
      .filter((domain) => domain.syncEnabled)
      .map((domain) => orgSlugToOrigin(orgSlug, domain.domain))
  );

  console.log('setting cookies onto', {
    knownOrgSlugs,
    targetDomains,
    targetOrigins,
  });

  const cookieList = cookieCache.toArray();
  const cookieStores = await browser.cookies.getAllCookieStores();
  const settled = await Promise.allSettled(
    targetOrigins.flatMap((targetOrigin) =>
      cookieStores.flatMap((store) =>
        cookieList.map(({cookie}) =>
          setTargetCookie(targetOrigin, cookie, store)
        )
      )
    )
  );
  console.groupEnd();
  return settled;
}

// ////////////////////////////////////////////////////////////////////////////
// Event listeners
// ////////////////////////////////////////////////////////////////////////////

/**
 * When a cookie is updated (logging in or out of sentry.io) we should automatically
 * propagate that into all our targets.
 *
 * @param changeInfo
 */
async function onCookieChanged(
  changeInfo: Cookies.OnChangedChangeInfoType
): Promise<void> {
  const {cookie} = changeInfo;
  if (!isProdDomain(cookie.domain) || !isKnownCookie(cookie.name)) {
    return;
  }
  console.group('Received onCookieChanged', {changeInfo});

  const cookieCache = await Storage.getCookieCache();
  cookieCache.insert(cookie.domain as Domain, cookie);
  await cookieCache.save();

  const results = await setCookiesOnKnownOrgs();
  debugResults('Cookie did update', results);
  console.groupEnd();
}

async function onTabUpdated(
  _tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
): Promise<void> {
  const origin = toUrl(tab.url)?.origin as Origin;
  if (!origin || !isProdOrigin(origin)) {
    return;
  }
  console.group('Received onTabUpdated', {changeInfo});

  const origins = tabsToOrigins([tab]);
  await Promise.all([saveFoundOrgs(origins), saveProdCookies(origins)]);

  const results = await setCookiesOnKnownOrgs();
  debugResults('Tab did update', results);
  console.groupEnd();
}

/**
 * When we get a message from the browser, read out the command, exec it and return the result
 */
async function onMessage(
  request: Message
): Promise<SyncNowResponse | StorageClearResponse | false> {
  if (!request.command) {
    return false;
  }
  console.group(`Received "${request.command}" command`);
  switch (request.command) {
    case 'sync-now': {
      await findAndCacheData();

      const results = await setCookiesOnKnownOrgs();
      debugResults('Sync complete', results);
      console.groupEnd();
      const stores = await browser.cookies.getAllCookieStores();
      console.log('cookie stores', stores);
      return results;
    }
    case 'storage-clear':
      await Storage.clear();
      console.groupEnd();
      return true;
    default:
      console.groupEnd();
      return false;
  }
}

/**
 * Service-worker entrypoint.
 */
(async function init() {
  console.clear();
  Storage.clear();
  console.info('Cookie Sync Service Worker is starting...');

  browser.cookies.onChanged.addListener(onCookieChanged);
  browser.tabs.onUpdated.addListener(onTabUpdated);
  browser.runtime.onMessage.addListener(onMessage);

  await onMessage({command: 'sync-now'});

  await Storage.debug();
})();

export {};
