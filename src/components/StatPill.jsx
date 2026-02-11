export default function StatPill({ label, value }) {
  return (
    <span className="pill">
      <span className="pillLabel">{label}</span>
      <span className="pillValue">{value}</span>
    </span>
  );
}
