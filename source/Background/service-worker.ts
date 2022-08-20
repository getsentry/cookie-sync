import {browser, Cookies, Runtime} from 'webextension-polyfill-ts';

console.log('Cookie Sync Service Worker is starting...');

type State = {
  cookieName: string;
  sourceUrl: URL;
  targetUrls: URL[];
};

const settingsCache: State = {
  cookieName: 'session',
  sourceUrl: new URL('https://sentry.io'),
  targetUrls: [
    new URL('https://dev.getsentry.net'),
    new URL('https://*.sentry.dev/'),
  ],
};

async function initSettingsCache() {
  const data = await browser.storage.sync.get(null);
  Object.assign(settingsCache, {
    cookieName: data.cookieName,
    sourceUrl: new URL(data.sourceUrl),
    targetUrls: data.targetUrls.map((s: string) => new URL(s)),
  });
}

async function fetchSourceCookie() {
  return browser.cookies.get({
    name: settingsCache.cookieName,
    url: settingsCache.sourceUrl.href,
  });
}

async function setTargetCookies(targets: string[], cookie: Cookies.Cookie) {
  console.log('setTargetCookies', targets);
  return Promise.allSettled(
    targets.map((url) => {
      const details = {
        url,
        expirationDate: cookie.expirationDate,
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        value: cookie.value,
      };
      return browser.cookies.set(details);
    })
  );
}

function urlToCookieTarget(url: URL) {
  return `${decodeURI(url.origin)}/`;
}

function urlToTabsQueryPattern(url: URL) {
  return `${decodeURI(url.toString())}*`;
}

async function getTargetUrls() {
  const storageTargets = settingsCache.targetUrls.map(urlToCookieTarget);

  const tabs = await browser.tabs.query({
    url: settingsCache.targetUrls.map(urlToTabsQueryPattern),
  });
  const tabTargets = tabs.map((tab) => new URL(tab.url || '')).map(urlToCookieTarget);

  return Array.from(new Set([
    ...storageTargets,
    ...tabTargets
  ]));
}

async function onCookieChanged(changeInfo: Cookies.OnChangedChangeInfoType) {
  const {cookie} = changeInfo;
  if (cookie.domain === settingsCache.sourceUrl.host && cookie.name === settingsCache.cookieName) {
    try {
      await setTargetCookies(await getTargetUrls(), changeInfo.cookie);
    } catch (error) {
      console.error(error);
    }
  }
}

(async function init() {
  await initSettingsCache();

  browser.storage.onChanged.addListener((_changes, _area) => {
    initSettingsCache();
  });

  browser.cookies.onChanged.addListener(onCookieChanged);
  
  browser.runtime.onMessage.addListener(async (
    request: Record<string, string>,
    sender: Runtime.MessageSender,
  ) => {
    if (request.command === "sync-now") {
      console.log('Syncing cookies now...');
      const [urls, cookie] = await Promise.all([getTargetUrls(), fetchSourceCookie()])
      const result = await setTargetCookies(urls, cookie);
      console.log('Sync complete', result);
      return result;
    }
    return false;
  });

  const [urls, cookie] = await Promise.all([getTargetUrls(), fetchSourceCookie()]);
  setTargetCookies(urls, cookie);
})();

export {};
