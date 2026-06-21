import { Link } from '@/i18n/navigation';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="error-boundary-page">
          <section className="error-panel" role="alert">
            <p className="error-panel__code">404</p>
            <h1>Page not found</h1>
            <p>The requested page does not exist.</p>
            <Link className="error-panel__action" href="/" locale="en">
              Return to the main app
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
