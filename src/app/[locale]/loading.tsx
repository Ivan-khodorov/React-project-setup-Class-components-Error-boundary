import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const translations = await getTranslations('Home');

  return (
    <div className="home-layout">
      <section className="results-section">
        <div role="status">{translations('loading')}</div>
      </section>
    </div>
  );
}
