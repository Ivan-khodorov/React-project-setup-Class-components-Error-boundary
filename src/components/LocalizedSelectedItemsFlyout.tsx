'use client';

import { useTranslations } from 'next-intl';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';

export function LocalizedSelectedItemsFlyout() {
  const translations = useTranslations('SelectedItems');

  return (
    <SelectedItemsFlyout
      translations={{
        clear: translations('clear'),
        count: (count) => translations('count', { count }),
        download: translations('download'),
        label: translations('label'),
      }}
    />
  );
}
