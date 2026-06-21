import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const translations = await getTranslations('About');

  return (
    <section className="page-section">
      <h1>{translations('title')}</h1>
      <p>{translations('author', { name: 'Ivan Khodorov' })}</p>
      <Link
        href="https://rs.school/courses/reactjs"
        rel="noreferrer"
        target="_blank"
      >
        {translations('course')}
      </Link>
    </section>
  );
}
