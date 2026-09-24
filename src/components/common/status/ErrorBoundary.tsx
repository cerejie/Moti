import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorState from "./ErrorState";

type IProps = {
  children: ReactNode;
  // Overrides the generic headline of the fallback.
  title?: string;
  // Overrides the generic sentence of the fallback.
  message?: string;
};

type IState = {
  error: Error | null;
};

// Contains a render error to the region it happened in. Without one, a single
// unexpected payload anywhere in the tree unmounts the whole app and leaves a
// blank screen. React exposes error catching only to class components, which
// is why this is the one class in the app.
class ErrorBoundary extends Component<IProps, IState> {
  state: IState = { error: null };

  static getDerivedStateFromError(error: Error): IState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Render error contained by ErrorBoundary:",
      error,
      info.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error === null) return this.props.children;

    return (
      <ErrorState
        title={this.props.title ?? "This section couldn't be displayed"}
        message={
          this.props.message ??
          "Something unexpected came back while showing this. Try again, or reload the page if it keeps happening."
        }
        onRetry={this.handleRetry}
      />
    );
  }
}

export default ErrorBoundary;
