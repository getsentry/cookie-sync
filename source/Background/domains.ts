const PATTERNS = {
  prod: [/https:\/\/(?<orgSlug>.*)(?<domain>\.sentry\.io)/],
  dev: [
    /http:\/\/(?<orgSlug>.*)(?<domain>\.localhost)/,
    /https:\/\/(?<orgSlug>.*)(?<domain>\.sentry\.dev)/,
    /https:\/\/(?<orgSlug>.*)(?<domain>\.dev\.getsentry\.net)/,
  ],
};

function extractFromPatterns(
  origin: string,
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

export function extractOrgSlug(origin: string) {
  return extractFromPatterns(origin, 'orgSlug', [
    ...PATTERNS.prod,
    ...PATTERNS.dev,
  ]);
}

export function extractDomain(origin: string) {
  return extractFromPatterns(origin, 'domain', [
    ...PATTERNS.prod,
    ...PATTERNS.dev,
  ]);
}

export function isProdOrigin(origin: string) {
  return PATTERNS.prod.some((pattern) => origin.match(pattern));
}

export function isProdDomain(domain: string) {
  // Prefix with some protocol, so a naked domain like `.sentry.io` looks like
  // an `origin` and can match our patterns.
  const protocols = ['http', 'http'];
  return protocols.some((protocol) =>
    PATTERNS.prod.some((pattern) => `${protocol}://${domain}`.match(pattern))
  );
}

export function orgSlugToOrigin(orgSlug: string, domain: string) {
  return `https://${orgSlug}.${domain}/`;
}
