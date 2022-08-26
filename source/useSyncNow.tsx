import * as React from "react";
import browser from "webextension-polyfill";

export default function useSyncNow() {
  const [result, setResult] = React.useState<any[] | string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const syncNow = React.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setResult(null);

    try {
      const resp = await browser.runtime.sendMessage({ command: "sync-now" });
      setResult(resp);
      return {
        result: resp,
        isLoading: false,
        isError: false,
      };
    } catch (err: any) {
      setResult(err.message);
      setIsError(true);
      console.error(err);
      return {
        result: null,
        isLoading: false,
        isError: err,
      };
    } finally {
      setIsLoading(false);
    }
    
  }, []);

  return {
    result,
    isLoading,
    isError,
    syncNow,
  };
}
