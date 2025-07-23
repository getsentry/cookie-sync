import * as React from 'react';
import browser from 'webextension-polyfill';

import Storage from '../Background/storage';

import './knownOrgs.css';
import type {Message} from '../types';

export default function KnownOrgs() {
  const [orgs, setOrgs] = React.useState<string[]>([]);

  const refreshOrgs = React.useCallback(() => {
    Storage.getOrgs().then(setOrgs);
  }, []);
  React.useEffect(refreshOrgs, [refreshOrgs]);

  return (
    <section className="knownOrgs-grid">
      <div>
        <h2>
          <button
            type="button"
            className="dev-ui-button small"
            style={{float: 'right'}}
            onClick={() => {
              browser.runtime
                .sendMessage({
                  command: 'find-and-cache-data',
                } as Message)
                .then(refreshOrgs);
            }}
          >
            Detect
          </button>
          <span>Known Orgs:</span>
        </h2>
        <ul>
          {orgs.map((orgSlug) => (
            <li key={orgSlug}>
              <span>{orgSlug}</span>
              <button
                type="button"
                className="dev-ui-button small"
                onClick={() => Storage.removeOrg(orgSlug).then(refreshOrgs)}
              >
                Forget
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
