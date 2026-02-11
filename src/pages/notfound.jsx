import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="shell">
      <h1>404</h1>
      <p className="muted">You wandered off the storyline. Respect.</p>
      <Link className="btn" to="/">Go Home</Link>
    </div>
  );
}
