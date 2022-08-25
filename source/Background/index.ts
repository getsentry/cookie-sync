import 'emoji-log';
import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener((): void => {
  console.emoji('🦄', 'extension installed');
});
