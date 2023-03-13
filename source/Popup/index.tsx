import { BrowserTracing } from "@sentry/tracing";
import * as React from 'react';
import * as Sentry from "@sentry/react";
import ErrorBoundary from "./ErrorBoundary";
import packageJSON from "../../package.json";
import Popup from "./Popup";
import ReactDOM from 'react-dom';

Sentry.init({
  dsn: "https://a5b41882d81d4be6af9b19d7c081d4e4@o1.ingest.sentry.io/4504753500979200",
  integrations: [new BrowserTracing()],

  release: packageJSON.version,

  sampleRate: 1.0,
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <ErrorBoundary>
    <Popup />
  </ErrorBoundary>,
  document.getElementById("popup-root")
);
