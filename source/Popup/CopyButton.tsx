import * as React from 'react';

interface Props {
  text: string;
}

export default function CopyButton({text}: Props) {
  const timeoutRef = React.useRef<undefined | ReturnType<typeof setTimeout>>();
  const [state, setState] =
    React.useState<'ready' | 'copied' | 'error'>('ready');

  const handleOnClick = React.useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setState('copied');
      })
      .catch((_error) => {
        setState('error');
      })
      .finally(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setState('ready'), 1000);
      });
  }, [text]);

  const label =
    // eslint-disable-next-line no-nested-ternary
    state === 'ready'
      ? 'Copy'
      : state === 'copied'
      ? 'Copied'
      : 'Unable to copy';

  return (
    <button type="button" className="copy-button" onClick={handleOnClick}>
      {label}
    </button>
  );
}
