import browser, {Cookies} from 'webextension-polyfill';

console.clear();
console.info('Cookie Sync Service Worker is starting...');

type State = {
  cookieNames: string[];
  sourceUrl: URL;
  targetUrls: URL[];
};

const settingsCache: State = {
  cookieNames: [
    'session', // Normal session cookie, you'll have this whether logged in or out
    'su', // SUPERUSER_COOKIE_NAME
    'sc', // CSRF_COOKIE_NAME
  ],
  sourceUrl: new URL('https://sentry.io'),
  targetUrls: [
    new URL('https://dev.getsentry.net'),
    new URL('https://*.sentry.dev'),
  ],
};

/**
 * Read the source cookies from the source domain.
 * 
 * @returns Array of Cookie values to be copied
 */
async function fetchSourceCookies(): Promise<Cookies.Cookie[]> {
  const cookies = await Promise.all(settingsCache.cookieNames.map((name) => browser.cookies.get({
    name,
    url: settingsCache.sourceUrl.href,
  })));
  return cookies.filter(Boolean);
}

/**
 * Set a Cookie against the target domain.
 * 
 * @param target Domain where the Cookie should be saved
 * @param cookie Original Cookie to be copied
 * @returns The saved Cookie
 */
async function setTargetCookie(targetDomain: string, cookie: Cookies.Cookie): Promise<Cookies.Cookie> {
  const details = {
    url: targetDomain,
    expirationDate: cookie.expirationDate,
    httpOnly: cookie.httpOnly,
    name: cookie.name,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    value: cookie.value,
  };
  return browser.cookies.set(details);
}

/**
 * Check to see if we're already logged in to sentry.io.
 * 
 * If we're not logged in (or sentry is down) then we should show a message
 * because cloning the cookie won't do much good.
 * 
 * @returns Promise<boolean>
 */
async function checkAuthStatus(): Promise<boolean> {
  const response = await fetch('https://sentry.io/api/0/internal/health/');
  return response.ok;
}

/**
 * Combine static target urls from the settings with any open tabs that match 
 * wildcard targets.
 * 
 * We can't know all the `.sentry.net` subdomains before hand, but if you have
 * a tab open then we can read that subdomain and set a cookie onto it.
 * @returns Promise<string[]>
 */
async function getTargetUrls(): Promise<string[]> {
  const targetOrigins = settingsCache.targetUrls.map(url => decodeURI(url.origin))

  const staticTargets = targetOrigins
    .filter(origin => !origin.includes('*'))
    .map(origin => `${origin}/`);
  
  const wildcardTargets = targetOrigins
    .filter(origin => origin.includes('*'))
    .map(origin => `${origin}/*`);

  const tabsMatchingWildcards = await browser.tabs.query({url: wildcardTargets});
  const tabTargets = tabsMatchingWildcards
    .map(tab => new URL(tab.url || '').origin)
    .map(origin => `${origin}/`);

  return Array.from(new Set([
    ...staticTargets,
    ...tabTargets
  ]));
}

/**
 * When a cookie is updated (logging in or out of sentry.io) we should automatically
 * propagate that into all our targets.
 * 
 * @param changeInfo 
 */
async function onCookieChanged(changeInfo: Cookies.OnChangedChangeInfoType): Promise<void> {
  if (!await checkAuthStatus()) {
    console.info('Logged out of sentry.io');
    return;
  }

  const {cookie} = changeInfo;  
  const urls = await getTargetUrls();

  settingsCache.cookieNames.forEach(async cookieName => {;
    if (cookie.domain === settingsCache.sourceUrl.host && cookie.name === cookieName) {
      try {      
        await Promise.all(urls.map(url => setTargetCookie(url, changeInfo.cookie)));
      } catch (error) {
        console.error(error);
      }
    }
  });
}

/**
 * When we get the sync-now command, we should propogate all the cookies into
 * all our targets.
 * 
 * @returns List of the results of setting each Cookie, or Error
 */
async function onSyncNow(): Promise<Error | PromiseSettledResult<Cookies.Cookie>[]> {
  if (!await checkAuthStatus()) {
    console.info('Logged out of sentry.io');
    return new Error('You are logged out of Sentry.io.')
  }

  const [urls, cookies] = await Promise.all([getTargetUrls(), fetchSourceCookies()]);
  const results = await Promise.allSettled(
    urls.flatMap(url => 
      cookies.map(cookie => setTargetCookie(url, cookie))
    )
  );
  console.info('Sync complete', results);  
  return results;
}

/**
 * Service-worker entrypoint.
 */
(function init() {
  browser.cookies.onChanged.addListener(onCookieChanged);
  
  browser.runtime.onMessage.addListener(async (request: Record<string, string>) => {
    if (request.command === "sync-now") {
      console.info('Received "sync-now" command');
      return await onSyncNow();
    }
    return false;
  });
})();

export {};
