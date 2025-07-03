import type {Cookies} from 'webextension-polyfill';

export type Message = {
  command: 'sync-now' | 'storage-clear';
};

export type SyncNowResponse = PromiseSettledResult<
  | {
      origin: string;
      cookie: Cookies.Cookie;
    }
  | undefined
>[];

export type StorageClearResponse = boolean;

export type Origin = `http://${string}/` | `https://${string}/`;
export type Domain =
  | `sentry.io`
  | `sentry.dev`
  | `dev.getsentry.net:7999`
  | `.sentry.io`
  | `.sentry.dev`
  | `.dev.getsentry.net:7999`
  | `${string}.sentry.io`
  | `${string}.sentry.dev`
  | `${string}.dev.getsentry.net:7999`;
