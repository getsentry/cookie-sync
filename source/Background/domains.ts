import type {Domain, Origin} from '../types';

const PATTERNS = {
  prod: [/https:\/\/(?<orgSlug>.*)(?<domain>\.sentry\.io)/],
  dev: [
    /https:\/\/(?<orgSlug>.*)(?<domain>\.sentry\.dev)/,
    /https:\/\/(?<orgSlug>.*)(?<domain>\.dev\.getsentry\.net)/,
  ],
};

function extractFromPatterns(
  origin: Origin,
  matchName: 'orgSlug',
  patterns: RegExp[]
): string | undefined;
function extractFromPatterns(
  origin: Origin,
  matchName: 'domain',
  patterns: RegExp[]
): Domain | undefined;
function extractFromPatterns(
  origin: Origin,
  matchName: number | string,
  patterns: RegExp[]
) {
  for (const pattern of patterns) {
    const match = origin.match(pattern);
    if (match) {
      return typeof matchName === 'string'
        ? match.groups?.[matchName]
        : match[matchName];
    }
  }
  return undefined;
}

export function extractOrgSlug(origin: Origin): string | undefined {
  return extractFromPatterns(origin, 'orgSlug', [
    ...PATTERNS.prod,
    ...PATTERNS.dev,
  ]);
}

export function extractDomain(origin: Origin): Domain | undefined {
  return extractFromPatterns(origin, 'domain', [
    ...PATTERNS.prod,
    ...PATTERNS.dev,
  ]);
}

export function isProdOrigin(origin: Origin): boolean {
  return PATTERNS.prod.some((pattern) => origin.match(pattern));
}

export function isProdDomain(domain: string): boolean {
  // Prefix with some protocol, so a naked domain like `.sentry.io` looks like
  // an `origin` and can match our patterns.
  return PATTERNS.prod.some((pattern) => `https://${domain}`.match(pattern));
}

export function orgSlugToOrigin(orgSlug: string, domain: string): Origin {
  return `https://${orgSlug}.${domain}/`;
}
