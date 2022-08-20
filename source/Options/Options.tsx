import {browser} from 'webextension-polyfill-ts';
import * as React from 'react';

import UrlInput from './UrlInput';

import './styles.scss';

type State = {
  cookieName: string;
  sourceUrl: URL;
  targetUrls: URL[];
};

export default function Options() {
  const newUrlInputRef = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<State>({
    cookieName: 'session',
    sourceUrl: new URL('https://sentry.io'),
    targetUrls: [
      new URL('https://dev.getsentry.net'),
      new URL('https://*.sentry.dev/'),
    ],
  });

  const loadStorage = async () => {
    const data = await browser.storage.sync.get(null);
    setState({
      cookieName: data.cookieName,
      sourceUrl: new URL(data.sourceUrl),
      targetUrls: data.targetUrls.map((s: string) => new URL(s)),
    });
  };

  const saveState = async (data: State) => {
    await browser.storage.sync.set({
      cookieName: data.cookieName,
      sourceUrl: data.sourceUrl.toString(),
      targetUrls: data.targetUrls.map((s) => s.toString()),
    });
    console.log('saved', data);
  };

  React.useEffect(() => {
    loadStorage();
  }, []);

  React.useEffect(() => {
    saveState(state);
  }, [state]);

  console.log({state});

  return (
    <div>
      <form>
        <p>
          <label htmlFor="cookieName">Cookie Name</label>
          <br />
          <input
            type="text"
            id="cookieName"
            name="cookieName"
            spellCheck="false"
            autoComplete="off"
            required
            defaultValue={state.cookieName}
          />
        </p>

        <UrlInput
          key="sourceUrl"
          id="sourceUrl"
          label="Source URL"
          url={state.sourceUrl}
        />

        {state.targetUrls.map((url, i) => (
          <UrlInput
            key={`targetURL${url.toString()}`}
            id={`targetURL${i}`}
            label={`Target URL ${i}`}
            url={url}
            actions={
              <button
                type="button"
                onClick={() => {
                  console.log('removing', url);
                  setState((prev) => ({
                    ...prev,
                    targetUrls: prev.targetUrls.filter((u) => u !== url),
                  }));
                }}
              >
                remove
              </button>
            }
          />
        ))}
      </form>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          try {
            const fd = new FormData(e.target as HTMLFormElement);
            const url = new URL(String(fd.get('newUrl')));
            setState((prev) => ({
              ...prev,
              targetUrls: prev.targetUrls.concat(url),
            }));
            if (newUrlInputRef.current) {
              newUrlInputRef.current.value = '';
            }
          } catch (_error) {
            alert('Invalid URL'); // eslint-disable-line no-alert
          }
        }}
      >
        <UrlInput
          inputRef={newUrlInputRef}
          key="newUrl"
          id="newUrl"
          label="New URL"
          url={null}
          actions={<button type="submit">add</button>}
        />
      </form>
    </div>
  );
}
