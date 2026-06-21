'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '../i18n/navigation';
import { routing } from '../i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const translations = useTranslations('Locale');

  const handleLocaleChange = (nextLocale: string) => {
    const query = searchParams
      ? Object.fromEntries(searchParams.entries())
      : {};

    router.replace(
      {
        pathname,
        ...(Object.keys(query).length > 0 ? { query } : {}),
      },
      { locale: nextLocale }
    );
  };

  return (
    <fieldset className="locale-switcher" aria-label={translations('selection')}>
      <legend className="locale-switcher__legend">
        {translations('label')}
      </legend>
      {routing.locales.map((localeOption) => (
        <label
          className={
            locale === localeOption
              ? 'locale-switcher__option locale-switcher__option--active'
              : 'locale-switcher__option'
          }
          key={localeOption}
        >
          <input
            checked={locale === localeOption}
            name="locale"
            type="radio"
            value={localeOption}
            onChange={() => handleLocaleChange(localeOption)}
          />
          <span>{translations(localeOption)}</span>
        </label>
      ))}
    </fieldset>
  );
}
