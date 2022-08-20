import * as React from 'react';

type Props = {
  id: string;
  label: string;
  url: null | URL;
  actions?: React.ReactNode | React.ReactNodeArray;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export default function UrlInput({id, label, url, actions, inputRef}: Props) {
  return (
    <p>
      <span style={{float: 'right'}}>{actions}</span>

      <label style={{display: 'block'}} htmlFor={id}>
        {label}
      </label>

      <input
        ref={inputRef}
        type="text"
        id={id}
        name={id}
        spellCheck="false"
        autoComplete="off"
        required
        defaultValue={url ? decodeURI(url.toString()) : ''}
      />
    </p>
  );
}
