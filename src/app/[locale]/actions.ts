'use server';

import { redirect } from '@/i18n/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

export async function searchCharacters(
  locale: string,
  formData: FormData
): Promise<void> {
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const rawSearchTerm = formData.get('query');
  const rawDetailsId = formData.get('details');
  const query = typeof rawSearchTerm === 'string' ? rawSearchTerm.trim() : '';
  const details =
    typeof rawDetailsId === 'string' ? rawDetailsId.trim() : '';

  redirect({
    href: {
      pathname: '/',
      query: {
        ...(details ? { details } : {}),
        ...(query ? { query } : {}),
        page: 1,
      },
    },
    locale: activeLocale,
  });
}
