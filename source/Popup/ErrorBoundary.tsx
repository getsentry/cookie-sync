import * as React from "react";
import * as Sentry from "@sentry/react";

type Props = {};
type State = {error: undefined | Error};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log("Caught an error", error, errorInfo)
    Sentry.captureException(error);
  }

  override render() {
    if (this.state.error) {
      console.log(this.state);
      return (
        <h1>Something went wrong.</h1>
      );
    }

    return this.props.children;
  }
}
