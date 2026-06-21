import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const translations = await getTranslations('NotFound');

  return (
    <section className="page-section error-page" role="alert">
      <div className="error-panel">
        <p className="error-panel__code">404</p>
        <h1>{translations('title')}</h1>
        <p>{translations('description')}</p>
        <Link className="error-panel__action" href="/">
          {translations('return')}
        </Link>
      </div>
    </section>
  );
}
