import browser, {Tabs} from 'webextension-polyfill';
import toUrl from '../utils/toUrl';

export function tabsToOrigins(tabs: Tabs.Tab[]) {
  return tabs.map((tab) => toUrl(tab.url)?.origin).filter(Boolean);
}

async function findOpenTabsMatching(urls: string[]) {
  return (
    await Promise.all(urls.map((url) => browser.tabs.query({url})))
  ).flat();
}

async function isApiHealthy(origin: string) {
  try {
    const healthCheckUrl = `${origin}/api/0/internal/health/`;
    const response = await fetch(healthCheckUrl);

    // If the fetch is successful, then the server is alive
    return response.ok;
  } catch (error) {
    return error as Error;
  }
}

async function isDevUi(tab: Tabs.Tab) {
  const origin = toUrl(tab.url)?.origin;
  if (!origin) {
    return false;
  }

  const healthy = await isApiHealthy(origin);
  // This tab is running a `yarn dev-ui` instance if there was a failure to
  // fetch the api health endpoint
  return healthy instanceof TypeError && healthy.message === 'Failed to fetch';
}

export async function findOpenDevUITabs() {
  const tabs = await findOpenTabsMatching([
    'https://*.dev.getsentry.net:7999/*',
    'https://*.sentry.dev/*',
  ]);

  return tabs.filter(isDevUi);
}

export async function findOpenProdTabs() {
  return findOpenTabsMatching(['https://*.sentry.io/*']);
}
