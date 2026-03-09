/**
 * PageTransition.jsx
 * Wrapper that applies a zoom-fade entrance animation to page content.
 * Uses the current location key to re-trigger animation on route changes.
 */

import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
}
