import type { Browser } from "wxt/browser";

export type Message = {
  command: "find-and-cache-data" | "sync-now" | "storage-clear";
};

export type SyncNowResponse = PromiseSettledResult<
  | {
      origin: string;
      cookie: Browser.cookies.Cookie;
    }
  | undefined
>[];

export type StorageClearResponse = boolean;
