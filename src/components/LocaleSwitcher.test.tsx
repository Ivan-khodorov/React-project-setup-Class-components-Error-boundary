import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocaleSwitcher } from './LocaleSwitcher';

const replace = vi.fn();

vi.mock('../i18n/navigation', () => ({
  usePathname: () => '/about',
  useRouter: () => ({ replace }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('page=2&query=spock'),
}));

vi.mock('next-intl', async (importOriginal) => {
  const original = await importOriginal<typeof import('next-intl')>();

  return {
    ...original,
    useLocale: () => 'en',
  };
});

const messages = {
  Locale: {
    en: 'English',
    label: 'Language',
    ru: 'Russian',
    selection: 'Language selection',
  },
};

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('renders the active locale', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleSwitcher />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Russian' })).not.toBeChecked();
  });

  it('switches locale while preserving pathname and query', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleSwitcher />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Russian' }));

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: '/about',
        query: {
          page: '2',
          query: 'spock',
        },
      },
      { locale: 'ru' }
    );
  });
});
