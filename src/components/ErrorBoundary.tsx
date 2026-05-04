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
        <main>
          <section role="alert">
            <h1>Something went wrong.</h1>
            <p>Please reload the page and try again.</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
