import * as React from 'react';

import FailedIcon from '../icons/FailedIcon';
import SuccessIcon from '../icons/SuccessIcon';

import useSyncNow from '../useSyncNow';

import './popup.css';

const Popup = () => {
  const { result, isLoading, isError, syncNow } = useSyncNow();

  console.log({
    result,
    isError,
    isLoading,
  });

  return (
    <section id="popup">
      <h1>Cookie Sync</h1>
      <div style={{ textAlign: 'center' }}>
        <button type="button" className="sync-button" onClick={syncNow} disabled={isLoading}>
          Sync Cookies Now
        </button>
      </div>

      {isError ? (
        <div className="error-alert">
          <FailedIcon width={20} height={20} />
          <div>{result}</div>
        </div>
      ) : null}

      {/* TODO: Assuming result is an array */}
      {/* TODO: Could pull out into component */}
      <div className="result">
        {!isError && Array.isArray(result)
          ? result.map((res, index) => (
              <div key={index} className="success-row">
                <SuccessIcon width={20} height={20} />
                <div>{decodeURI(res.value.domain)}</div>
              </div>
            ))
          : null}
      </div>
    </section>
  );
};

export default Popup;
