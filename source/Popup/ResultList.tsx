import * as React from 'react';
import {serializeError} from 'serialize-error';

import SuccessIcon from '../icons/SuccessIcon';
import FailedIcon from '../icons/FailedIcon';
import uniq from '../utils/uniq';
import uniqBy from '../utils/uniqBy';

import type {SyncNowResponse} from '../types';
import CopyButton from './CopyButton';

const ResultList = ({results}: {results: SyncNowResponse}) => {
  const successfulCookies = Array.from(
    new Set(
      results.map((promiseResult) =>
        promiseResult.status === 'fulfilled' ? promiseResult.value : null
      )
    )
  ).filter(Boolean);

  const cookies = uniqBy(
    successfulCookies.map((cookie) => cookie.cookie),
    (cookie) => cookie.name
  );
  const origins = uniq(successfulCookies.map((cookie) => cookie.origin));

  return (
    <>
      <table>
        <thead>
          <tr>
            <th colSpan={2}>Found Cookies</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr key={cookie.name}>
              <td>{cookie.name}</td>
              <td>
                <input disabled value={cookie.value} style={{width: '100%'}} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th colSpan={3}>Domains</th>
          </tr>
        </thead>
        <tbody>
          {results.map((promiseResult, index) =>
            promiseResult.status === 'fulfilled' ? null : (
              /* eslint-disable-next-line react/no-array-index-key */
              <tr key={index} className="error-row">
                <td>
                  <FailedIcon width={20} height={20} />
                </td>
                <td colSpan={2}>
                  {JSON.stringify(serializeError(promiseResult.reason)) ||
                    'Rejected'}
                </td>
              </tr>
            )
          )}
          {origins.map((origin) => (
            <tr key={origin} className="success-row">
              <td>
                <SuccessIcon width={20} height={20} />
              </td>
              <td>
                <a href={origin} target="_blank" rel="noreferrer">
                  {origin}
                </a>
              </td>
              <td align="right">
                <CopyButton
                  text={results
                    .map((promiseResult) => {
                      if (
                        promiseResult.status === 'fulfilled' &&
                        promiseResult.value?.origin === origin
                      ) {
                        const {
                          domain,
                          expirationDate,
                          name,
                          path,
                          sameSite,
                          value,
                        } = promiseResult.value.cookie;
                        return `document.cookie='${name}=${value};domain=${domain};expires=${expirationDate};path=${path};samesite=${sameSite};';`;
                      }
                      return '';
                    })
                    .filter(Boolean)
                    .join('\n')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ResultList;
