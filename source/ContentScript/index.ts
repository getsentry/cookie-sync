import * as React from 'react';
import ReactDOM from 'react-dom';

import Banner from './Banner';

function onReady(fn: () => void) {
  if (['complete', 'interactive'].includes(document.readyState)) {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onReady(() => {
  const reactRoot = document.createElement('div');

  const body = document.querySelector('body');
  body?.appendChild(reactRoot);

  ReactDOM.render(React.createElement(Banner, null, null), reactRoot);
});

export {};
