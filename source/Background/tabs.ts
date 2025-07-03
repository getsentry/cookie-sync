import browser, {Tabs} from 'webextension-polyfill';
import toUrl from '../utils/toUrl';
import type {Origin} from '../types';

export function tabsToOrigins(tabs: Tabs.Tab[]): Origin[] {
  return tabs.map((tab) => toUrl(tab.url)?.origin as Origin).filter(Boolean);
}

type TabUrlPattern = `http://*.${string}/*` | `https://*.${string}/*`;

async function findOpenTabsMatchingPattern(
  urls: TabUrlPattern[]
): Promise<browser.Tabs.Tab[]> {
  return (
    await Promise.all(urls.map((url) => browser.tabs.query({url})))
  ).flat();
}

export async function findOpenDevUITabs(): Promise<browser.Tabs.Tab[]> {
  return findOpenTabsMatchingPattern([
    'https://*.dev.getsentry.net:7999/*',
    'https://*.sentry.dev/*',
  ]);
}

export async function findOpenProdTabs(): Promise<browser.Tabs.Tab[]> {
  return findOpenTabsMatchingPattern(['https://*.sentry.io/*']);
}
