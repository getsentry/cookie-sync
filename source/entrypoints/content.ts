import { defineContentScript } from "wxt/utils/define-content-script";
import { mountContentScript } from "../ContentScript";

export default defineContentScript({
  matches: [
    "https://*.sentry.dev/auth/login/",
    "https://dev.getsentry.net:7999/auth/login/",
    "https://*.dev.getsentry.net:7999/auth/login/",
    "https://new.staging.getsentry.net/auth/login",
  ],
  main() {
    mountContentScript();
  },
});
