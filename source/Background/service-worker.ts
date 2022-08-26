import browser, {Cookies, Runtime} from 'webextension-polyfill';

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
  if (data.cookieName) {
    Object.assign(settingsCache, {
      cookieName: data.cookieName,
    });
  }

  if (data.sourceUrl) {
    Object.assign(settingsCache, {
      sourceUrl: new URL(data.sourceUrl),
    });
  }

  if (data.targetUrls) {
    Object.assign(settingsCache, {
      targetUrls: data.targetUrls.map((s: string) => new URL(s)),
    });
  }
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

async function checkAuthStatus() {
  const response = await fetch('https://sentry.io/api/0/internal/health/');
  console.log("health say", response.ok);
  return response.ok;
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
  if (!await checkAuthStatus()) {
    console.log('Logged out of sentry.io');
    return;
  }

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
    // @ts-expect-error
    sender: Runtime.MessageSender,
  ) => {
    if (request.command === "sync-now") {
      console.log('Syncing cookies now...');

      if (!await checkAuthStatus()) {
        console.log('You are logged out of sentry.io');
        throw new Error('You are logged out of Sentry.io.');
      }

      const [urls, cookie] = await Promise.all([getTargetUrls(), fetchSourceCookie()])
      const result = await setTargetCookies(urls, cookie);
      console.log('Sync complete', result);
      return result;
    }
    return false;
  });
})();

export {};
