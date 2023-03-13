import * as React from "react";
import browser from "webextension-polyfill";

import type {Message, SyncNowResponse} from "./types";

type State = {
  isLoading: boolean;
  results: undefined | SyncNowResponse;
  error: undefined | Error;
};

export default function useSyncNow() {
  const [state, setState] = React.useState<State>({
    isLoading: false,
    results: undefined,
    error: undefined,
  });

  const syncNow = React.useCallback(async () => {
    const setAndReturnState = (s: State) => {
      setState(s);
      return s;
    };

    setState({
      isLoading: true,
      error: undefined,
      results: undefined,
    });

    try {
      const results = (await browser.runtime.sendMessage({
        command: "sync-now",
      } as Message)) as SyncNowResponse;

      return setAndReturnState({
        isLoading: false,
        results: results,
        error: undefined,
      });
    } catch (err: unknown) {
      return setAndReturnState({
        isLoading: false,
        results: undefined,
        error: err as Error,
      });
    }
  }, []);

  return {
    syncNow,
    ...state
  };
}
