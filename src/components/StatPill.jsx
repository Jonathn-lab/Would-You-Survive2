/**
 * StatPill.jsx
 * A small pill-shaped display component for showing a single stat (e.g. Health: 5).
 *
 * Props:
 *   - label: The name of the stat displayed in uppercase (e.g. "Health").
 *   - value: The numeric or string value of the stat (e.g. 5).
 *
 * Uses the legacy "pill" CSS classes from styles.css for styling.
 * Note: The main game screen (game.jsx) uses inline stat-pill markup
 * instead of this component, but StatPill is available for reuse elsewhere.
 */

export default function StatPill({ label, value }) {
  return (
    <span className="pill">
      {/* Stat name label, styled as small uppercase text */}
      <span className="pillLabel">{label}</span>
      {/* Stat value, styled with bold font weight */}
      <span className="pillValue">{value}</span>
    </span>
  );
}
