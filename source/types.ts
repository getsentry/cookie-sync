import type {Cookies} from 'webextension-polyfill';

export type Message = {
  command: 
    | 'sync-now'
    | 'storage-clear';
}

export type SyncNowResponse = PromiseSettledResult<{
    origin: string;
    cookie: Cookies.Cookie;
}>[];

export type StorageClearResponse = boolean;
