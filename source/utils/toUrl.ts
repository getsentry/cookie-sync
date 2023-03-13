export default function toUrl(url: undefined | string): undefined | URL {
  return url ? new URL(url) : undefined;
}
