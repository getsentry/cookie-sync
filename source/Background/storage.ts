import browser, {Cookies} from 'webextension-polyfill';
import uniq from '../utils/uniq';
import uniqBy from '../utils/uniqBy';

type CookiesByNameAndOrg = {
  [orgSlug: string]: {
    [cookieName: string]: Cookies.Cookie
  }
};

type Domain = {
  domain: string,
  syncEnabled: boolean,
};

type StorageFields = {
  cookies: CookiesByNameAndOrg;
  domains: Domain[];
  orgs: string[];
}

const DEFAULT_ORGS: ReadonlyArray<string> = [];
const DEFAULT_DOMAINS: ReadonlyArray<Domain> = [
  {domain: 'dev.getsentry.net:7999', syncEnabled: true},
  {domain: 'localhost', syncEnabled: false},
  {domain: 'sentry.dev', syncEnabled: true},
];

const localStorage = {
  get: <Key extends string = keyof StorageFields>(key: Key): Promise<Partial<StorageFields>> =>
    browser.storage.local.get(key),
  set: (items: Partial<StorageFields>) =>
    browser.storage.local.set(items),
};

class Storage {
  private cookieCache: CookieCache | null = null

  clear = browser.storage.local.clear

  debug = async () => {
    const all = await browser.storage.local.get([
      'cookies',
      'domains',
      'orgs',
    ]);

    console.group('Storage.debug();');
    Object.entries(all).map(([key, value]) => {
      console.log('Storage:', key);
      console.table(value);
    })
    console.groupEnd();
  }

  getDomains = async () => {
    const result = await localStorage.get('domains');
    return result.domains ?? DEFAULT_DOMAINS;
  }

  setDomain = async (opts: Pick<Domain, 'domain'> & Partial<Domain>) => {
    const prevDomains = await this.getDomains();
    const updated: Domain = {
      syncEnabled: true,
      ...prevDomains.find(domain => domain.domain === opts.domain),
      ...opts,
    };
    const sortedDomains = uniqBy([updated].concat(prevDomains), (domain) => domain.domain)
      .sort((a, b) => a.domain < b.domain ? -1 : 1);

    await localStorage.set({
      domains: sortedDomains,
    });
  }

  getOrgs = async () => {
    const result = await localStorage.get('orgs');
    return Array.from(result.orgs || DEFAULT_ORGS);
  }

  saveOrg = async (orgSlugs: string | string[]) => {
    const prevOrgs = await this.getOrgs();
    await localStorage.set({
      orgs: uniq(prevOrgs.concat(orgSlugs)),
    });
  }

  getCookieCache = async () => {
    if (!this.cookieCache) {
      const all = await localStorage.get('cookies');
      this.cookieCache = new CookieCache(all.cookies || {});
    }
    return this.cookieCache;
  }
}

class CookieCache {
  constructor(private cache: CookiesByNameAndOrg) {}  

  insert(domain: string, cookie: Cookies.Cookie) {
    this.cache = {
      ...this.cache,
      [domain]: {
        ...this.cache[domain] || {},
        [cookie.name]: cookie,
      },
    };
  }

  save = async () => {
    await localStorage.set({cookies: this.cache});
  }

  toArray = () => {
    return Object.entries(this.cache).map(([domain, cookiesByName]) => 
      Object.entries(cookiesByName).map(([cookieName, cookie]) => ({domain, cookieName, cookie}))
    ).flat();
  }
}

const storage = new Storage();

export default storage;
