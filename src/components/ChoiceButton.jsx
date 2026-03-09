/**
 * ChoiceButton.jsx
 * A button component for story choices during gameplay.
 *
 * Props:
 *   - children:        The choice label text.
 *   - onClick:         Callback when the player clicks this choice.
 *   - disabled:        If true, the choice is locked (requirement not met).
 *   - keyHint:         Keyboard shortcut number to display (e.g. "1").
 *   - requirementHint: Text explaining why the choice is locked (e.g. "Requires: Flashlight").
 */

export default function ChoiceButton({ children, onClick, disabled, keyHint, requirementHint }) {
  return (
    <button
      className={`choiceBtn${disabled ? " locked" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-label={disabled && requirementHint ? `${children} (${requirementHint})` : undefined}
    >
      <span className="choiceBtn-inner">
        {disabled && <span className="choice-lock-icon" aria-hidden="true" />}
        {keyHint && !disabled && <span className="choice-key-hint" aria-hidden="true">{keyHint}</span>}
        <span className="choiceBtn-text">
          {children}
          {requirementHint && (
            <span className="choice-req-hint">{requirementHint}</span>
          )}
        </span>
      </span>
    </button>
  );
}
