import * as React from 'react';

import DomainsEnabled from './DomainsEnabled';
import FailedIcon from '../icons/FailedIcon';
import ResultList from "./ResultList";
import useSyncNow from '../useSyncNow';
import VersionBadge from "./VersionBadge";

import './popup.css';

const Popup = () => {
  const { results, isLoading, error, syncNow } = useSyncNow();

  return (
    <section id="popup">
      <h1>Cookie Sync</h1>

      <DomainsEnabled />
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          className="sync-button"
          onClick={syncNow}
          disabled={isLoading}
        >
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
        {results?.length ? <ResultList results={results} /> : null}
      </div>
      <VersionBadge />
    </section>
  );
};

export default Popup;
