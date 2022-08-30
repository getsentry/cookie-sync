import * as React from 'react';

import FailedIcon from '../icons/FailedIcon';
import SuccessIcon from '../icons/SuccessIcon';
import useSyncNow from '../useSyncNow';

import './popup.css';

const Popup = () => {
  const { results, isLoading, error, syncNow } = useSyncNow();

  return (
    <section id="popup">
      <h1>Cookie Sync</h1>
      <div style={{ textAlign: 'center' }}>
        <button type="button" className="sync-button" onClick={syncNow} disabled={isLoading}>
          Sync Cookies Now
        </button>
      </div>

      {error ? (
        <div className="error-alert">
          <FailedIcon width={20} height={20} />
          <div>{error}</div>
        </div>
      ) : null}

      <div className="result">
        {results?.length
          ? results.map((promiseResult, index) =>
              promiseResult.status === 'fulfilled' ? (
                <div key={index} className="success-row">
                  <SuccessIcon width={20} height={20} />
                  <div>{decodeURI(promiseResult.value.domain)}</div>
                </div>
              ) : (
                <div key={index} className="error-row">
                  <FailedIcon width={20} height={20} />
                  <div>{promiseResult.reason}</div>
                </div>
              )
            )
          : null}
      </div>
    </section>
  );
};

export default Popup;
