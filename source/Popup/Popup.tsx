import * as React from 'react';
import {browser, Cookies} from 'webextension-polyfill-ts';

import './styles.scss';

type Cookie = Cookies.Cookie;

const SOURCE_URL: URL = new URL('https://sentry.io');
const TARGET_URLS: URL[] = [
  new URL('https://dev.getsentry.net'),
  new URL('https://sentry.dev/'),
];
const COOKIE_NAME = 'session';

function Error({e}: {e: Error | unknown}) {
  return e ? (
    <div style={{border: '1px solid red'}}>
      <pre>{JSON.stringify(e, null, '\t')}</pre>
    </div>
  ) : null;
}

function Value({children, label}: {children: unknown; label: string}) {
  return (
    <React.Fragment>
      <dt>{label}</dt>
      <dd>
        <pre>{JSON.stringify(children, null, '\t')}</pre>
      </dd>
    </React.Fragment>
  );
}

async function genCurrentCookie(url: URL) {
  return browser.cookies.get({
    name: COOKIE_NAME,
    url: url.href,
  });
}

function useSourceCookie() {
  const [error, setError] = React.useState<Error | unknown>();
  const [sourceCookie, setSourceCookieValue] = React.useState<Cookie>();

  const loadSource = React.useCallback(async () => {
    try {
      setSourceCookieValue(await genCurrentCookie(SOURCE_URL));
    } catch (err) {
      setError(err);
    }
  }, []);

  React.useEffect(() => {
    loadSource();
  }, [loadSource]);

  return {
    sourceCookie,
    error,
  };
}

function useTargetCookies() {
  const [error, setError] = React.useState<Error | unknown>();
  const [targetCookies, setTargetCookieValues] = React.useState<Cookie[]>();

  const loadTargets = React.useCallback(async () => {
    try {
      setTargetCookieValues(
        await Promise.all(TARGET_URLS.map(genCurrentCookie))
      );
    } catch (err) {
      setError(err);
    }
  }, []);

  const setTargets = React.useCallback(
    async (cookie: undefined | Cookie) => {
      if (!cookie) {
        return;
      }
      try {
        await Promise.all(
          TARGET_URLS.map((url) => {
            const details = {
              url: url.href,
              expirationDate: cookie.expirationDate,
              httpOnly: cookie.httpOnly,
              name: cookie.name,
              sameSite: cookie.sameSite,
              secure: cookie.secure,
              value: cookie.value,
            };
            return browser.cookies.set(details);
          })
        );
      } catch (err) {
        setError(err);
      }
      loadTargets();
    },
    [loadTargets]
  );

  React.useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  return {
    targetCookies,
    setTargets,
    error,
  };
}

function useOnCookieChanged(callback: (cookie: Cookie) => void) {
  React.useEffect(() => {
    const onChanged = (changeInfo: Cookies.OnChangedChangeInfoType) => {
      const {cookie} = changeInfo;
      if (cookie.domain === SOURCE_URL.host && cookie.name === COOKIE_NAME) {
        callback(changeInfo.cookie);
      }
    };
    browser.cookies.onChanged.addListener(onChanged);

    return () => {
      browser.cookies.onChanged.removeListener(onChanged);
    };
  }, [callback]);
}

const Popup: React.FC = () => {
  const {sourceCookie, error: sourceError} = useSourceCookie();
  const {targetCookies, setTargets, error: targetError} = useTargetCookies();
  React.useEffect(() => {
    setTargets(sourceCookie);
  }, [setTargets, sourceCookie]);

  useOnCookieChanged(setTargets);

  return (
    <section id="popup">
      <h2>Cookie Sync</h2>
      <Error e={sourceError} />
      <Error e={targetError} />
      <dl>
        <Value label="Source URL">{SOURCE_URL}</Value>
        <Value label="Target URLs">{TARGET_URLS}</Value>
        <Value label="Cookie Name">{COOKIE_NAME}</Value>
        <Value label="Cookie Value">{sourceCookie}</Value>

        <Value label="Target Values">{targetCookies}</Value>
      </dl>
    </section>
  );
};

export default Popup;
