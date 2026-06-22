import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  translations?: {
    code: string;
    description: string;
    title: string;
  };
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
    const translations = this.props.translations ?? {
      code: 'Error',
      description:
        'Please reload the page and try again. The error was logged for debugging.',
      title: 'Something went wrong.',
    };

    if (this.state.hasError) {
      return (
        <main className="error-boundary-page">
          <section className="error-panel" role="alert">
            <p className="error-panel__code">{translations.code}</p>
            <h1>{translations.title}</h1>
            <p>{translations.description}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
