import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Page not found</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          The route you requested does not exist.
        </p>
        <Link className="btn btn-primary" to="/">
          Go back to dashboard
        </Link>
      </div>
    </section>
  );
}
