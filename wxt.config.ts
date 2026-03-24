import { readFileSync } from "node:fs";
import { defineConfig } from "wxt";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

const hostPermissions = [
  "https://*.sentry.io/*",
  "https://*.sentry.dev/*",
  "https://*.dev.getsentry.net/*",
];

export default defineConfig({
  srcDir: "source",
  modules: ["@wxt-dev/module-react"],
  manifest: ({ browser }) => ({
    name: "Sentry Cookie Sync",
    short_name: "Cookie Sync",
    version: packageJson.version,
    description: "Sync cookies for local frontend development of sentry.io",
    homepage_url: "https://github.com/getsentry/cookie-sync",
    author: "Ryan Albrecht",
    icons: {
      "32": "assets/icons/favicon-32.png",
      "128": "assets/icons/favicon-128.png",
      "180": "assets/icons/favicon-180.png",
      "192": "assets/icons/favicon-192.png",
    },
    permissions:
      browser === "firefox"
        ? ["cookies", "storage", "tabs", ...hostPermissions]
        : ["cookies", "storage", "tabs"],
    host_permissions: browser === "firefox" ? undefined : hostPermissions,
    content_security_policy:
      browser === "firefox"
        ? "script-src 'self'; object-src 'self'"
        : {
            extension_pages: "script-src 'self'; object-src 'self'",
          },
    minimum_chrome_version: browser === "chrome" ? "88" : undefined,
    browser_specific_settings:
      browser === "firefox"
        ? {
            gecko: {
              id: "{f7fe2556-f3c9-4167-a98e-671faacf82cf}",
            },
          }
        : undefined,
    browser_action:
      browser === "firefox"
        ? {
            default_popup: "popup.html",
            default_title: "Sentry Cookie Sync",
            browser_style: false,
          }
        : undefined,
    action:
      browser === "firefox"
        ? undefined
        : {
            default_popup: "popup.html",
            default_title: "Sentry Cookie Sync",
          },
  }),
  zip: {
    excludeSources: [
      ".git/**",
      ".output/**",
      ".wxt/**",
      ".addfox/**",
      "extension/**",
    ],
  },
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      if ("action" in manifest && manifest.action) {
        manifest.action.default_title = "Sentry Cookie Sync";
      }

      if ("browser_action" in manifest && manifest.browser_action) {
        manifest.browser_action.default_title = "Sentry Cookie Sync";
      }
    },
  },
});
