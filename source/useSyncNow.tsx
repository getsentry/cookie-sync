import * as React from "react";
import browser, {Cookies} from "webextension-polyfill";

type State = {
  isLoading: boolean;
  results: undefined | PromiseSettledResult<Cookies.Cookie>[];
  error: undefined | Error;
};

export default function useSyncNow() {
  const [state, setState] = React.useState<State>({
    isLoading: false,
    results: undefined,
    error: undefined,
  });

  const syncNow = React.useCallback(async () => {
    setState({
      isLoading: true,
      error: undefined,
      results: undefined,
    });

    try {
      const results = (await browser.runtime.sendMessage({
        command: "sync-now",
      })) as Error | PromiseSettledResult<Cookies.Cookie>[];

      if (results instanceof Error) {
        setState({
          isLoading: false,
          results: undefined,
          error: results,
        });
        return {
          isLoading: false,
          results: undefined,
          error: results,
        };
      }

      setState({
        isLoading: false,
        results: results,
        error: undefined,
      });
      return {
        isLoading: false,
        results: results,
        error: undefined,
      };
    } catch (err: unknown) {
      setState({
        isLoading: false,
        results: undefined,
        error: err as Error,
      });
      return {
        isLoading: false,
        results: undefined,
        error: err as Error,
      };
    }
  }, []);

  return {
    syncNow,
    ...state
  };
}
