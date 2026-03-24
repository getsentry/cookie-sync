import type { Cookies } from 'webextension-polyfill';

export type Message = {
  command: 'find-and-cache-data' | 'sync-now';
};

export type SyncNowResponse = PromiseSettledResult<
  | {
      origin: string;
      cookie: Cookies.Cookie;
    }
  | undefined
>[];
