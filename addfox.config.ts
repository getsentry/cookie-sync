import {readFileSync} from 'fs';

import {defineConfig} from 'addfox';
import {pluginReact} from '@rsbuild/plugin-react';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as {version: string};

const hostPermissions = [
  'https://*.sentry.io/*',
  'https://*.sentry.dev/*',
  'https://*.dev.getsentry.net/*',
];

const contentScriptMatches = [
  'https://*.sentry.dev/auth/login/',
  'https://dev.getsentry.net:7999/auth/login/',
  'https://*.dev.getsentry.net:7999/auth/login/',
  'https://new.staging.getsentry.net/auth/login',
];

const sharedManifest = {
  name: 'Sentry Cookie Sync',
  version: packageJson.version,
  icons: {
    '32': 'icons/favicon-32.png',
    '128': 'icons/favicon-128.png',
    '180': 'icons/favicon-180.png',
    '192': 'icons/favicon-192.png',
  },
  description: 'Sync cookies for local frontend development of sentry.io',
  homepage_url: 'https://github.com/getsentry/cookie-sync',
  short_name: 'Cookie Sync',
  author: 'Ryan Albrecht',
  content_scripts: [
    {
      matches: contentScriptMatches,
      js: ['[addfox.content]'],
    },
  ],
};

export default defineConfig({
  manifest: {
    chromium: {
      ...sharedManifest,
      manifest_version: 3,
      permissions: ['cookies', 'storage', 'tabs'],
      host_permissions: hostPermissions,
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'",
      },
      minimum_chrome_version: '88',
      action: {
        default_title: 'Sentry Cookie Sync',
      },
    },
    firefox: {
      ...sharedManifest,
      manifest_version: 2,
      permissions: ['cookies', 'storage', 'tabs', ...hostPermissions],
      content_security_policy: "script-src 'self'; object-src 'self'",
      browser_specific_settings: {
        gecko: {
          id: '{f7fe2556-f3c9-4167-a98e-671faacf82cf}',
        },
      },
      browser_action: {
        default_title: 'Sentry Cookie Sync',
        browser_style: false,
      },
    },
  },
  plugins: [pluginReact()],
});
