import browser, {Cookies} from 'webextension-polyfill';
import uniq from '../utils/uniq';
import {extractDomain} from './domains';
import type {Origin} from './domains';

const cookieNames: ReadonlyArray<string> = [
  'session', // Normal session cookie, you'll have this whether logged in or out
  'sentry-su', // SUPERUSER_COOKIE_NAME
  'su', // SUPERUSER_COOKIE_NAME
  'sentry-staff', // STAFF_COOKIE_NAME
  'staff', // STAFF_COOKIE_NAME
  'sentry-sc', // CSRF_COOKIE_NAME
  'sc', // CSRF_COOKIE_NAME
  'sentry-sudo', // SUDO_COOKIE_NAME
  'sudo', // SUDO_COOKIE_NAME
];

export function isKnownCookie(cookieName: string): boolean {
  return cookieNames.includes(cookieName);
}

async function getKnownCookieFor(origin: Origin): Promise<Cookies.Cookie[]> {
  return (
    await Promise.all(
      cookieNames.map((name) => browser.cookies.get({name, url: origin}))
    )
  ).filter(Boolean);
}

/**
 * Get a list of cookies we care about for each origin requested
 *
 * @param origins List of Origin values
 * @returns Map<Origin, Cookie[]>
 */
export async function getCookiesByOrigin(
  origins: Origin[]
): Promise<Map<Origin, browser.Cookies.Cookie[]>> {
  const cookiesByOrigin = new Map<Origin, Cookies.Cookie[]>();
  await Promise.all(
    uniq(origins).map(async (origin) => {
      const cookies = await getKnownCookieFor(origin);
      cookiesByOrigin.set(origin, cookies);
    })
  );

  return cookiesByOrigin;
}

/**
 * Set a Cookie against the target domain.
 *
 * @param origin The request-URI to associate with the setting of the cookie
 * @param targetDomain Domain, extracted from the origin, where the Cookie should be saved
 * @param cookie Original Cookie to be copied
 * @returns {origin: Origin, cookie: Cookie}
 */
export async function setTargetCookie(
  origin: Origin,
  cookie: Cookies.Cookie
): Promise<
  | {
      origin: Origin;
      cookie: Cookies.Cookie;
    }
  | undefined
> {
  const domain = extractDomain(origin);
  if (!domain) {
    return undefined;
  }
  const details: browser.Cookies.SetDetailsType = {
    url: origin,
    domain,
    expirationDate: cookie.expirationDate,
    httpOnly: cookie.httpOnly,
    name: cookie.name,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    value: cookie.value,
  };
  const updated = await browser.cookies.set(details);
  return {origin, cookie: updated};
}
