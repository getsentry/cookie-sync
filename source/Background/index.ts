import 'emoji-log';
import {BrowserTracing} from '@sentry/tracing';
import * as Sentry from '@sentry/browser';
import browser from 'webextension-polyfill';
import packageJSON from '../../package.json';

Sentry.init({
  dsn: 'https://a5b41882d81d4be6af9b19d7c081d4e4@o1.ingest.sentry.io/4504753500979200',
  integrations: [new BrowserTracing()],

  release: packageJSON.version,

  sampleRate: 1.0,
  tracesSampleRate: 1.0,
});

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'Cookie Sync extension installed');
});
