import * as React from 'react';

import Storage from '../Background/storage';

import './domainsEnabled.css';

// eslint-disable-next-line
type SyncDomains = Awaited<ReturnType<typeof Storage.getDomains>>;

function useDomainsEnabled() {
  const [domains, setDomains] = React.useState<SyncDomains>();

  const refreshDomains = React.useCallback(() => {
    Storage.getDomains().then(setDomains);
  }, []);

  React.useEffect(refreshDomains, [refreshDomains]);

  return {
    domains,
    refreshDomains,
  };
}

function ListItem({
  domain,
  disabled = false,
  refreshDomains,
}: {
  domain: SyncDomains[number];
  disabled?: boolean;
  refreshDomains: ReturnType<typeof useDomainsEnabled>['refreshDomains'];
}) {
  return (
    <li>
      <label htmlFor={`input-domain-${domain.domain}`}>
        <input
          id={`input-domain-${domain.domain}`}
          type="checkbox"
          checked={domain.syncEnabled}
          disabled={disabled}
          onChange={async (e) => {
            await Storage.setDomain({
              domain: domain.domain,
              syncEnabled: e.target.checked,
            });
            refreshDomains();
          }}
        />
        <span>{domain.domain}</span>
      </label>
    </li>
  );
}

export default function DomainsEnabled() {
  const {domains, refreshDomains} = useDomainsEnabled();

  return (
    <section className="domainsEnabled-grid">
      <div>
        <h2>Sync From</h2>
        <ul>
          <ListItem
            domain={{domain: 'sentry.io', syncEnabled: true}}
            disabled={true}
            refreshDomains={refreshDomains}
          />
        </ul>
      </div>
      <div>
        <h2>Sync To</h2>
        <ul>
          {domains?.map((domain) => (
            <ListItem
              key={domain.domain}
              domain={domain}
              refreshDomains={refreshDomains}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
