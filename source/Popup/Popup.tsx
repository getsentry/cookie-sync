import { browser } from "webextension-polyfill-ts";
import * as React from 'react';

import Value from './Value';

import './styles.scss';

const Popup: React.FC = () => {
  const [lastResult, setLastResult] = React.useState();

  const syncNow = React.useCallback(async () => {
    const resp = await browser.runtime.sendMessage({ command: "sync-now" });
    setLastResult(resp);
  }, []);

  return (
    <section id="popup">
      <h2>Cookie Sync</h2>
      <button type="button" onClick={() => syncNow()}>
        Sync Cookies Now
      </button>
      {lastResult ? <Value label="Sync'd">{lastResult}</Value> : null}
    </section>
  );
};

export default Popup;
