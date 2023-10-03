import * as React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './ErrorBoundary';
import Popup from './Popup';

ReactDOM.render(
  <ErrorBoundary>
    <Popup />
  </ErrorBoundary>,
  document.getElementById('popup-root')
);
