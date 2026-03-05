/**
 * RecapModal.jsx
 * "Previously on WYS..." overlay shown when loading a saved game.
 * Displays recent choices, current stats, and inventory to re-orient the player.
 *
 * Props:
 *   - isOpen:       Boolean controlling visibility.
 *   - onClose:      Dismiss the modal and start playing.
 *   - storyTitle:   Current story name.
 *   - act:          Current act number string.
 *   - accentColor:  Story accent hex for theming.
 *   - recentChoices: Array of { choiceLabel, nodeSnippet } for last few decisions.
 *   - stats:        Current stats object { health, stamina, stress, luck }.
 *   - inventory:    Current inventory array of item strings.
 *   - savedAt:      Timestamp (ms) of when the save was created.
 */

import { useEffect, useCallback } from "react";

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecapModal({
  isOpen,
  onClose,
  storyTitle,
  act,
  accentColor,
  recentChoices,
  stats,
  inventory,
  savedAt,
}) {
  const handleKey = useCallback((e) => {
    if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div className="recap-overlay" onClick={onClose}>
      <div className="recap-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="recap-header">
          <span className="recap-heading">Previously on</span>
          <span className="recap-story" style={{ color: accentColor }}>
            {storyTitle}
          </span>
          <div className="recap-meta">
            <span
              className="act-badge"
              style={{
                background: `${accentColor}20`,
                borderColor: `${accentColor}35`,
                color: accentColor,
              }}
            >
              Act {act}
            </span>
            {savedAt && <span className="muted">Saved {timeAgo(savedAt)}</span>}
          </div>
        </div>

        {/* Recent choices */}
        {recentChoices.length > 0 && (
          <div className="recap-section">
            <span className="recap-section-label">Recent Decisions</span>
            <div className="recap-choice-list">
              {recentChoices.map((c, i) => (
                <div key={i} className="recap-choice-item">
                  <span className="recap-choice-arrow" style={{ color: accentColor }}>
                    &rsaquo;
                  </span>
                  <span className="recap-choice-label">{c.choiceLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="recap-section">
            <span className="recap-section-label">Current Status</span>
            <div className="recap-stats">
              <div className="stat-pill health">
                <span className="pillLabel">Health</span>
                <span className="pillValue">{stats.health}</span>
              </div>
              <div className="stat-pill stamina">
                <span className="pillLabel">Stamina</span>
                <span className="pillValue">{stats.stamina}</span>
              </div>
              <div className="stat-pill stress">
                <span className="pillLabel">Stress</span>
                <span className="pillValue">{stats.stress}</span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory */}
        {inventory && inventory.length > 0 && (
          <div className="recap-section">
            <span className="recap-section-label">Inventory</span>
            <div className="chips">
              {inventory.map((item) => (
                <span key={item} className="chip">{item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <button className="btn-primary recap-continue" onClick={onClose}>
          Continue
        </button>
        <span className="recap-hint muted">Press Space to continue</span>
      </div>
    </div>
  );
}
