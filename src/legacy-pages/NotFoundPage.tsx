import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="page-section error-page" role="alert">
      <div className="error-panel">
        <p className="error-panel__code">404</p>
        <h1>Page not found</h1>
        <p>
          The requested page does not exist. Check the address or return to the
          main app.
        </p>
        <Link className="error-panel__action" to="/">
          Return to the main app
        </Link>
      </div>
    </section>
  );
}
