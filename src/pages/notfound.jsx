/**
 * notfound.jsx
 * A simple 404 "Not Found" page displayed when the user navigates
 * to a URL path that does not match any defined route.
 *
 * Provides a link back to the home page so the user can recover.
 */

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="shell">
      {/* Large 404 heading */}
      <h1>404</h1>
      {/* Humorous message fitting the game's survival theme */}
      <p className="muted">You wandered off the storyline. Respect.</p>
      {/* Link back to the home/landing page */}
      <Link className="btn" to="/">Go Home</Link>
    </div>
  );
}
