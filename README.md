# Sentry.io Cookie Sync

A browser pluging to help copy cookies from sentry.io so you can be logged-in to 
your sentry devapp and vercel sandboxes.

## 🚀 Installation

You can download the bundled extension for your browser from the github releases page [here](https://github.com/getsentry/hackweek-cookie-sync/releases/tag/latest).

_NOTE: This plugin will not auto-update_

- ### Chromium Based Browsers (Chrome, Edge, Opera)

    1. Visit: [chrome://extensions](chrome://extensions) or [edge://extensions](edge://extensions) or [about://extensions](about://extensions) (in opera).
    2. Enable `Developer Mode`. Toggle is in the top-right corner (Chrome, Opera) or left sidebar (Edge)
        1. If you just enabled developer mode refresh the page.
    3. Drag & drop the `.zip` file you downloaded into the page.

- ### Firefox

    1. Get an [ESR](https://www.mozilla.org/en-US/firefox/enterprise/), [Developer](https://www.mozilla.org/en-US/firefox/developer/), or [Nightly build](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly) of firefox.
    2. Follow Mozilla's instructions to enable installing unsigned addons [here](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox#w_what-are-my-options-if-i-want-to-use-an-unsigned-add-on-advanced-users).
      - Visit [about:config](about:config)
      - Set `xpinstall.signatures.required = false`
      - Set `extensions.langpacks.signatures.required = false`
    3. Visit [about:addons](about:addons)
    4. Drag & drop the `firefox.crx` file you downloaded into the page.

## 🖥️ Developing

Ensure you have:

- [Node.js](https://nodejs.org) 10 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Then run the following:

- `yarn install` to install dependencies.
- `yarn run dev:chrome` to start the development server for chrome extension
- `yarn run dev:firefox` to start the development server for firefox addon
- `yarn run build:chrome` to build chrome extension
- `yarn run build:firefox` to build firefox addon
- `yarn run build` builds and packs extensions all at once to extension/ directory

### Development

- `yarn install` to install dependencies.
- To watch file changes in development

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Edge
    - `yarn run dev:edge`
  - Opera
    - `yarn run dev:opera`

- **Load extension in browser**

- ### Chrome

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select your browsers folder in `extension/`.

- ### Firefox

  - Load the Add-on via `about:debugging` as temporary Add-on.
  - Choose the `manifest.json` file in the extracted directory

### Production

- `yarn run build` builds the extension for all the browsers to `extension/BROWSER` directory respectively.

Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.

If you don't want to use `package.json` version, you can disable the option by changing `usePackageJSONVersion` inside [webpack.config.js](https://github.com/getsentry/hackweek-cookie-sync/blob/main/webpack.config.js#L86).

### Generating browser specific manifest.json

Update `source/manifest.json` file with browser vendor prefixed manifest keys

```js
{
  "__chrome__name": "SuperChrome",
  "__firefox__name": "SuperFox",
  "__edge__name": "SuperEdge",
  "__opera__name": "SuperOpera"
}
```

if the vendor is `chrome` this compiles to:

```js
{
  "name": "SuperChrome",
}
```

---

Add keys to multiple vendors by separating them with | in the prefix

```
{
  __chrome|opera__name: "SuperBlink"
}
```

if the vendor is `chrome` or `opera`, this compiles to:

```
{
  "name": "SuperBlink"
}
```

See the original [README](https://github.com/abhijithvijayan/wext-manifest-loader) of `wext-manifest-loader` package for more details

## Bugs

Please file an issue [here](https://github.com/getsentry/hackweek-cookie-sync/issues) for feature requests, bugs, missing documentation, or unexpected behavior.

## License

[MIT ©](https://github.com/getsentry/hackweek-cookie-sync/blob/main/LICENCE)
