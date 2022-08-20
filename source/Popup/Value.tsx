import * as React from 'react';

export default function Value({
  children,
  label,
}: {
  children: unknown;
  label: string;
}) {
  return (
    <React.Fragment>
      <dt>{label}</dt>
      <dd>
        <pre>{JSON.stringify(children, null, '\t')}</pre>
      </dd>
    </React.Fragment>
  );
}
