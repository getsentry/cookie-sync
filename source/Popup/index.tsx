import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import Popup from './Popup';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <ErrorBoundary>
    <Popup />
  </ErrorBoundary>,
  document.getElementById('popup-root')
);
