/**
 * Origin syntax:
 *     <scheme>://<hostname>:<port>
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
 */
export type ProdOrigin = `https://${string}.sentry.io/`;
export type DevOrigin =
  | `https://${string}.sentry.dev/`
  | `https://${string}.dev.getsentry.net:7999/`;
export type Origin = ProdOrigin | DevOrigin;

/**
 * For example:
 *     developer.mozilla.org
 *
 * https://developer.mozilla.org/en-US/docs/Glossary/Domain
 */
export type ProdDomain = `sentry.io` | `${string}.sentry.io`;
export type DevDomain =
  | `sentry.dev`
  | `${string}.sentry.dev`
  | `dev.getsentry.net:7999`
  | `${string}.dev.getsentry.net:7999`;
export type Domain = ProdDomain | DevDomain;

const DOMAIN_PATTERNS = {
  prod: [/^(?<domain>sentry\.io)$/],
  dev: [/^(?<domain>sentry\.dev)$/, /^(?<domain>dev\.getsentry\.net:7999)$/],
};
const ORIGIN_PATTERNS = {
  prod: [/^https:\/\/(?<orgSlug>.*)\.(?<domain>sentry\.io)\/$/],
  dev: [
    /^https:\/\/(?<orgSlug>.*)\.(?<domain>sentry\.dev)\/$/,
    /^https:\/\/(?<orgSlug>.*)\.(?<domain>dev\.getsentry\.net:7999)\/$/,
  ],
};

export function isProdOrigin(maybeOrigin: string): maybeOrigin is ProdOrigin {
  return ORIGIN_PATTERNS.prod.some((pattern) => maybeOrigin.match(pattern));
}

export function isDevOrigin(maybeOrigin: string): maybeOrigin is DevOrigin {
  return ORIGIN_PATTERNS.dev.some((pattern) => maybeOrigin.match(pattern));
}

export function isProdDomain(maybeDomain: string): maybeDomain is ProdDomain {
  return DOMAIN_PATTERNS.prod.some((pattern) => maybeDomain.match(pattern));
}

export function isDevDomain(maybeDomain: string): maybeDomain is DevDomain {
  return DOMAIN_PATTERNS.dev.some((pattern) => maybeDomain.match(pattern));
}

function extractFromPatterns(
  domainOrOrigin: string,
  matchName: 'orgSlug',
  patterns: RegExp[]
): string | undefined;
function extractFromPatterns(
  domainOrOrigin: string,
  matchName: 'domain',
  patterns: RegExp[]
): Domain | undefined;
function extractFromPatterns(
  domainOrOrigin: string,
  matchName: number | string,
  patterns: RegExp[]
) {
  for (const pattern of patterns) {
    const match = domainOrOrigin.match(pattern);
    if (match) {
      return typeof matchName === 'string'
        ? match.groups?.[matchName]
        : match[matchName];
    }
  }
  return undefined;
}

export function extractOrgSlug(domainOrOrigin: string): string | undefined {
  if (isProdDomain(domainOrOrigin) || isDevDomain(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'orgSlug', [
      ...DOMAIN_PATTERNS.prod,
      ...DOMAIN_PATTERNS.dev,
    ]);
  }
  if (isProdOrigin(domainOrOrigin) || isDevOrigin(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'orgSlug', [
      ...ORIGIN_PATTERNS.prod,
      ...ORIGIN_PATTERNS.dev,
    ]);
  }
  return undefined;
}

export function extractDomain(domainOrOrigin: string): Domain | undefined {
  if (isProdDomain(domainOrOrigin) || isDevDomain(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'domain', [
      ...DOMAIN_PATTERNS.prod,
      ...DOMAIN_PATTERNS.dev,
    ]);
  }
  if (isProdOrigin(domainOrOrigin) || isDevOrigin(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'domain', [
      ...ORIGIN_PATTERNS.prod,
      ...ORIGIN_PATTERNS.dev,
    ]);
  }
  return undefined;
}

export function orgSlugToOrigin(orgSlug: string, domain: Domain): Origin {
  return `https://${orgSlug}.${domain}/`;
}
