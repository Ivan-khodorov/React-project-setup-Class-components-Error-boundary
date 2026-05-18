import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="page-section" role="alert">
      <h1>Page not found</h1>
      <p>The requested page does not exist.</p>
      <Link to="/">Return to the main app</Link>
    </section>
  );
}
