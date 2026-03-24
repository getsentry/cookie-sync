# Sentry.io Cookie Sync

A browser plugin to automatically sync cookies for local frontend development of sentry.io. This extension will copy cookies from sentry.io and make them available for your development environment, including version sandbox deployments.

![](./public/assets/example-full-chrome.png)

## 🚀 Installation

You can install the latest version of the Cookie Sync extension using the links below:

- [Get Cookie Sync for Chrome](https://chrome.google.com/webstore/detail/sentry-cookie-sync/kchlmkcdfohlmobgojmipoppgpedhijh)
- [Get Cookie Sync for Firefox](https://addons.mozilla.org/en-US/firefox/addon/sentry-cookie-sync/)

This is the recommended installation method.

## 🔧 Manual Installation

You can download the bundled extension for your browser from the github releases page [here](https://github.com/getsentry/cookie-sync/releases).

_NOTE: Auto-update will not work with manual installations._

- ### Chromium Based Browsers (Chrome)

    1. Visit: [`chrome://extensions`](chrome://extensions).
    2. Enable `Developer Mode`
        - Chrome: The toggle button is in the top-right corner
        - Refresh the page!
    3. Drag & drop the `.zip` file you downloaded into the page.

- ### Firefox

    1. Get an [ESR](https://www.mozilla.org/en-US/firefox/enterprise/), [Developer](https://www.mozilla.org/en-US/firefox/developer/), or [Nightly build](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly) of firefox.
    2. Follow Mozilla's instructions to enable installing unsigned addons [here](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox#w_what-are-my-options-if-i-want-to-use-an-unsigned-add-on-advanced-users).
        - Visit [`about:config`](about:config)
        - Set `xpinstall.signatures.required = false`
        - Set `extensions.langpacks.signatures.required = false`
    3. Visit [about:addons](about:addons)
    4. Drag & drop the Firefox `.zip` file you downloaded into the page.

- ### Safari

    The full extension is not avaialble on Safari. Instead you can manually read
    cookies from the extension inside Firefox or a Chrome based browser then
    write those cookies into Safari.

    *Using a browser with this extension installed:*
    1. login to production and also the domain you want to use within Safari.
         - for example, login to [sentry.sentry.io](https://sentry.sentry.io) to get refreshed cookies
         - then visit to [sentry.dev.getsentry.net:7999](https://sentry.dev.getsentry.net:7999) so the extension learns about that domain too
    2. Open the extension and click "Sync Cookies Now".
    3. Click the "Copy" button next to the domain you want to use within Safari.
    4. Paste the copied `document.cookie=...` snippet into the Safari JavaScript Console.

## 🐛 Bugs

Please file an issue [here](https://github.com/getsentry/cookie-sync/issues) for feature requests, bugs, missing documentation, or unexpected behavior.

## 🖥️ Developing

Ensure you have:

- [Node.js](https://nodejs.org) 18 or later installed
- [pnpm](https://pnpm.io) 9 or later installed

Then run the following:

- `pnpm install` to install dependencies.
- `pnpm run dev:chrome` to start the development server for the Chrome extension
- `pnpm run dev:firefox` to start the development server for the Firefox addon
- `pnpm run build:chrome` to build the Chromium package
- `pnpm run build:firefox` to build the Firefox package
- `pnpm run build` builds and packs both browsers into `.addfox/extension/`

### Test in Dev Mode

1. `pnpm install` to install dependencies.
2. `pnpm run dev:chrome` or `pnpm run dev:firefox` to watch file changes in development
3. Load the extension in your browser

    _NOTE: Remove any existing versions first_

    #### Chrome

    - Go to the browser address bar and type `chrome://extensions`.
    - Check the `Developer Mode` button to enable it.
    - Click on the `Load Unpacked Extension…` button.
    - Select the folder `cookie-sync/.addfox/extension/extension-chromium`.

    #### Firefox [ESR](https://www.mozilla.org/en-US/firefox/enterprise/), [Developer](https://www.mozilla.org/en-US/firefox/developer/), or [Nightly build](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly)

    - Go to the browser address bar and type `about:debugging#/runtime/this-firefox`.
    - Click on the `Temporary Extensions` Section, then the `Load Temporary Add-on…` button.
    - Select the file `cookie-sync/.addfox/extension/extension-firefox/manifest.json`.

### Test Prod builds

- `pnpm run build` builds the extension for Chrome and Firefox.

Note: By default `package.json` is set to version `0.0.0`. The CI pipeline updates that version before building the bundles, and `addfox.config.ts` uses it as the manifest version source.

### Browser-specific manifests

Update `addfox.config.ts` with per-browser manifest branches:

```js
{
  manifest: {
    chromium: {
      name: "SuperChrome"
    },
    firefox: {
      name: "SuperFox"
    }
  }
}
```

## Publishing

New versions will be automatically published into the Chrome and Firefox Extension/Addon stores via the Github Actions CI pipeline.

To modify the content of the store pages, you will need access to the respective accounts.

Chrome Store Page:

1. Using your @sentry.io account, become a member of the `role-deploy-sentry-browser-extension` google group
2. Visit https://chrome.google.com/webstore/devconsole and [Register as a Chrome Web Store developer](https://developer.chrome.com/docs/webstore/register/).
3. Access the [listing](https://chrome.google.com/webstore/devconsole/d1e3adb2-fbbf-437c-bbbe-e3c0a9d34cfe/kchlmkcdfohlmobgojmipoppgpedhijh/edit/listing) in the "sentry.io" publisher.

Firefox Addon Page:

1. Using 1Password access the "Mozilla Extension Publisher: cookie-sync@sentry.io" credentials
2. Visit the Firefox Addon Store here: https://addons.mozilla.org/en-US/developers/addon/sentry-cookie-sync/edit

## License

[MIT ©](https://github.com/getsentry/cookie-sync/blob/main/LICENSE)
