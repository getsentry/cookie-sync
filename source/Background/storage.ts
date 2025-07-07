import browser, {Cookies} from 'webextension-polyfill';
import uniq from '../utils/uniq';
import uniqBy from '../utils/uniqBy';
import {Domain} from './domains';

type CookiesByNameAndOrg = {
  [orgSlug: string]: {
    [cookieName: string]: Cookies.Cookie;
  };
};

type SyncDomain = {
  domain: Domain;
  syncEnabled: boolean;
};

type StorageFields = {
  cookies: CookiesByNameAndOrg;
  domains: SyncDomain[];
  orgs: string[];
};

const DEFAULT_ORGS: ReadonlyArray<string> = [];
const DEFAULT_DOMAINS: ReadonlyArray<SyncDomain> = [
  {domain: 'dev.getsentry.net:7999', syncEnabled: true},
  {domain: 'sentry.dev', syncEnabled: true},
];

const localStorage = {
  get: <Key extends string = keyof StorageFields>(
    key: Key
  ): Promise<Partial<StorageFields>> => browser.storage.local.get(key),
  set: (items: Partial<StorageFields>) => browser.storage.local.set(items),
};

class CookieCache {
  constructor(private cache: CookiesByNameAndOrg) {}

  insert(domain: Domain, cookie: Cookies.Cookie): void {
    this.cache = {
      ...this.cache,
      [domain]: {
        ...(this.cache[domain] || {}),
        [cookie.name]: cookie,
      },
    };
  }

  save = (): Promise<void> => {
    return localStorage.set({cookies: this.cache});
  };

  toArray = (): {
    domain: Domain;
    cookieName: string;
    cookie: Cookies.Cookie;
  }[] => {
    return Object.entries(this.cache)
      .map(([domain, cookiesByName]) =>
        Object.entries(cookiesByName).map(([cookieName, cookie]) => ({
          domain: domain as Domain,
          cookieName,
          cookie,
        }))
      )
      .flat();
  };
}

class Storage {
  private cookieCache: CookieCache | null = null;

  clear = browser.storage.local.clear;

  debug = async () => {
    const all = await browser.storage.local.get(['cookies', 'domains', 'orgs']);

    console.group('Storage.debug();');
    Object.entries(all).forEach(([key, value]) => {
      console.log('Storage:', key);
      console.table(value);
    });
    console.groupEnd();
  };

  getDomains = async () => {
    const result = await localStorage.get('domains');
    return result.domains ?? DEFAULT_DOMAINS;
  };

  setDomain = async (
    opts: Pick<SyncDomain, 'domain'> & Partial<SyncDomain>
  ) => {
    const prevDomains = await this.getDomains();
    const updated: SyncDomain = {
      syncEnabled: true,
      ...prevDomains.find((domain) => domain.domain === opts.domain),
      ...opts,
    };
    const sortedDomains = uniqBy(
      [updated].concat(prevDomains),
      (domain) => domain.domain
    ).sort((a, b) => (a.domain < b.domain ? -1 : 1));

    await localStorage.set({
      domains: sortedDomains,
    });
  };

  getOrgs = async (): Promise<string[]> => {
    const result = await localStorage.get('orgs');
    return Array.from(result.orgs || DEFAULT_ORGS);
  };

  saveOrg = async (orgSlugs: string | string[]): Promise<void> => {
    const prevOrgs = await this.getOrgs();
    await localStorage.set({
      orgs: uniq(prevOrgs.concat(orgSlugs)),
    });
  };

  getCookieCache = async (): Promise<CookieCache> => {
    if (!this.cookieCache) {
      const all = await localStorage.get('cookies');
      this.cookieCache = new CookieCache(all.cookies || {});
    }
    return this.cookieCache;
  };
}

const storage = new Storage();

export default storage;
