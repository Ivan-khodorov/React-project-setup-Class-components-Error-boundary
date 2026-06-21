'use client';

import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/context/ThemeProvider';
import { store } from '@/store/store';

interface AppProvidersProps {
  children: ReactNode;
  errorTranslations: {
    code: string;
    description: string;
    title: string;
  };
}

export function AppProviders({
  children,
  errorTranslations,
}: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary translations={errorTranslations}>
        <ThemeProvider>{children}</ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}
