import { getTranslations, setRequestLocale } from 'next-intl/server';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const translations = await getTranslations('Home');

  return (
    <section className="page-section">
      <h1>{translations('title')}</h1>
      <p>{translations('description')}</p>
    </section>
  );
}
