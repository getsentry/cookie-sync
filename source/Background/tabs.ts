import { browser, type Browser } from "wxt/browser";
import toUrl from "../utils/toUrl";
import type { Origin } from "./domains";

export function tabsToOrigins(tabs: Browser.tabs.Tab[]): Origin[] {
  return tabs.map((tab) => toUrl(tab.url)?.origin as Origin).filter(Boolean);
}

type TabUrlPattern = `http://*.${string}/*` | `https://*.${string}/*`;

async function findOpenTabsMatchingPattern(
  urls: TabUrlPattern[],
): Promise<Browser.tabs.Tab[]> {
  return (
    await Promise.all(urls.map((url) => browser.tabs.query({ url })))
  ).flat();
}

export async function findOpenDevUITabs(): Promise<Browser.tabs.Tab[]> {
  return findOpenTabsMatchingPattern([
    "https://*.dev.getsentry.net:7999/*",
    "https://*.sentry.dev/*",
  ]);
}

export async function findOpenProdTabs(): Promise<Browser.tabs.Tab[]> {
  return findOpenTabsMatchingPattern(["https://*.sentry.io/*"]);
}
