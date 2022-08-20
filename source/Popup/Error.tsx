import * as React from 'react';

export default function Error({e}: {e: Error | unknown}) {
  return e ? (
    <div style={{border: '1px solid red'}}>
      <pre>{JSON.stringify(e, null, '\t')}</pre>
    </div>
  ) : null;
}
