import * as React from "react";

import FailedIcon from "../icons/FailedIcon";

import useSyncNow from '../useSyncNow';

export default function Banner() {
  const {syncNow, error } = useSyncNow();

  return (
    <React.Fragment>
      <Styles />
      <div id="__sentry_cookie_sync_banner__">
        <div>
          <button
            className="sync-button"
            onClick={async () => {
              const { results, error } = await syncNow();
              if (!error && results?.length) {
                const target = window.location.origin + "/";
                window.location.href = target;
              }
            }}
          >
            Sync Cookies & Login Now
          </button>
        </div>

        {error ? (
          <div className="error-alert">
            <div>
              <FailedIcon width={24} height={24} />
              <div>{error}</div>
              <a target="_blank" href="https://sentry.io/auth/login/">
                Login
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}

function Styles() {
  return (
    <style>
      {`
      #__sentry_cookie_sync_banner__ {
        align-items: self-end;
        background-color: var(--surface100);
        color: var(--gray500);
        display: flex;
        flex-direction: column;
        font-size: 16px;
        font-size: 2em;
        gap: 8px;
        justify-content: center;
        padding: 16px;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1;
      }

      #__sentry_cookie_sync_banner__ h1 {
        font-size: 1.625rem;
        font-weight: 600;
        text-align: center;
      }

      #__sentry_cookie_sync_banner__ .sync-button {
        background-color: #7669D3;
        border-radius: 4px;
        border-radius: 4px;
        border: 1px solid #7669D3;
        box-shadow: 0 1px 4px rgb(10 8 12 / 20%);
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-size: 0.875rem;
        font-weight: 600;
        height: 34px;
        line-height: 1rem;
        margin-bottom: 16px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 8px;
        text-transform: none;
      }

      #__sentry_cookie_sync_banner__ .error-alert {
        background: white;
        border-radius: 4px;
        font-size: 16px;
      }


      #__sentry_cookie_sync_banner__ .error-alert svg {
        color: rgba(245, 84, 89, 0.5);
      }

      #__sentry_cookie_sync_banner__ .error-alert > div {
        background: rgba(245, 84, 89, 0.09);
        border-radius: 4px;
        border: 1px solid rgba(245, 84, 89, 0.5);
        color: black;
        display: flex;
        gap: 8px;
        padding: 12px 16px;
      }
    `}
    </style>
  );
}
