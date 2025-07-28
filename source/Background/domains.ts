/**
 * Origin syntax:
 *     <scheme>://<hostname>:<port>
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
 */
export type ProdOrigin = `https://sentry.io` | `https://${string}.sentry.io`;
export type DevOrigin =
  | `https://${string}.sentry.dev`
  | `https://${string}.dev.getsentry.net:7999`;
export type Origin = ProdOrigin | DevOrigin;

const ORIGIN_PATTERNS = {
  prod: [/^https:\/\/((?<orgSlug>[^.]+)\.)?(?<domain>sentry\.io)$/],
  dev: [
    /^https:\/\/([^.]+\.)?(?<domain>sentry\.dev)$/,
    /^https:\/\/((?<orgSlug>[^.]+)\.)?(?<domain>dev\.getsentry\.net:7999)$/,
  ],
};

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
  prod: [/^((?<orgSlug>[^.]+)\.)?(?<domain>sentry\.io)$/],
  dev: [
    /^([^.]+\.)?(?<domain>sentry\.dev)$/,
    /^((?<orgSlug>[^.]+)\.)?(?<domain>dev\.getsentry\.net:7999)$/,
  ],
};

export function isProdOrigin(maybeOrigin: string): maybeOrigin is ProdOrigin {
  return ORIGIN_PATTERNS.prod.some((pattern) => maybeOrigin.match(pattern));
}

export function isDevOrigin(maybeOrigin: string): maybeOrigin is DevOrigin {
  return ORIGIN_PATTERNS.dev.some((pattern) => maybeOrigin.match(pattern));
}

export function isProdDomain(maybeDomain: string): maybeDomain is ProdDomain {
  if (maybeDomain.startsWith('http://') || maybeDomain.startsWith('https://')) {
    return false;
  }
  return DOMAIN_PATTERNS.prod.some((pattern) => maybeDomain.match(pattern));
}

export function isDevDomain(maybeDomain: string): maybeDomain is DevDomain {
  if (maybeDomain.startsWith('http://') || maybeDomain.startsWith('https://')) {
    return false;
  }
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
  if (isProdOrigin(domainOrOrigin) || isDevOrigin(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'orgSlug', [
      ...ORIGIN_PATTERNS.prod,
      ...ORIGIN_PATTERNS.dev,
    ]);
  }
  if (isProdDomain(domainOrOrigin) || isDevDomain(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'orgSlug', [
      ...DOMAIN_PATTERNS.prod,
      ...DOMAIN_PATTERNS.dev,
    ]);
  }
  return undefined;
}

export function extractDomain(domainOrOrigin: string): Domain | undefined {
  if (isProdOrigin(domainOrOrigin) || isDevOrigin(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'domain', [
      ...ORIGIN_PATTERNS.prod,
      ...ORIGIN_PATTERNS.dev,
    ]);
  }
  if (isProdDomain(domainOrOrigin) || isDevDomain(domainOrOrigin)) {
    return extractFromPatterns(domainOrOrigin, 'domain', [
      ...DOMAIN_PATTERNS.prod,
      ...DOMAIN_PATTERNS.dev,
    ]);
  }
  return undefined;
}

export function orgSlugToOrigin(orgSlug: string, domain: Domain): Origin {
  switch (domain) {
    case 'sentry.io':
    case 'sentry.dev':
    case 'dev.getsentry.net:7999':
      return `https://${orgSlug}.${domain}`;
    default:
      return `https://${domain}`;
  }
}

export function originToDomain(origin: Origin): Domain {
  if (isProdOrigin(origin)) {
    return origin.replace('https://', '') as ProdDomain;
  }
  if (isDevOrigin(origin)) {
    return origin.replace('https://', '') as DevDomain;
  }
  throw new Error(`Unknown origin: ${origin}`);
}

export function stripOrgSlug(domain: Domain): Domain {
  if (domain.endsWith('.sentry.io')) {
    return 'sentry.io';
  }
  if (domain.endsWith('.sentry.dev')) {
    return 'sentry.dev';
  }
  if (domain.endsWith('.dev.getsentry.net:7999')) {
    return 'dev.getsentry.net:7999';
  }
  return domain;
}

export function stripPort(domain: Domain): string {
  return domain.replace(/:7999$/, '');
}
