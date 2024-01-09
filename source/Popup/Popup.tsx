import * as React from 'react';
import browser from 'webextension-polyfill';

import DomainsEnabled from './DomainsEnabled';
import FailedIcon from '../icons/FailedIcon';
import ResultList from './ResultList';
import useSyncNow from '../useSyncNow';

import './popup.css';

const Popup = () => {
  const {results, isLoading, error, syncNow} = useSyncNow();

  return (
    <section id="popup">
      <h1>Cookie Sync</h1>

      <DomainsEnabled />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <button
          type="button"
          className="sync-button"
          onClick={syncNow}
          disabled={isLoading}
        >
          Sync Cookies Now
        </button>
        <button
          type="button"
          className="dev-ui-button"
          onClick={() => {
            browser.tabs
              .query({currentWindow: true, active: true})
              .then((tabs) => {
                const tab = tabs[0];
                if (!tab) {
                  throw new Error('No active tab');
                }

                const newUrl = tab.url?.replace(
                  'sentry.io',
                  'dev.getsentry.net:7999'
                );
                return browser.tabs.create({url: newUrl});
              })
              .catch((e: unknown) => {
                console.error('Error opening new tab', e);
              });
          }}
        >
          Open in Dev UI
        </button>
      </div>

      {error ? (
        <div className="error-alert">
          <FailedIcon width={20} height={20} />
          <div>{error}</div>
        </div>
      ) : null}

      <div className="result">
        {results?.length ? <ResultList results={results} /> : null}
      </div>
    </section>
  );
};

export default Popup;
