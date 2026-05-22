import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'Application error caught by ErrorBoundary:',
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary-page">
          <section className="error-panel" role="alert">
            <p className="error-panel__code">Error</p>
            <h1>Something went wrong.</h1>
            <p>
              Please reload the page and try again. The error was logged for
              debugging.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
