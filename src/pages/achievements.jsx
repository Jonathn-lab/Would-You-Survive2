/**
 * achievements.jsx
 * Trophy Case page — displays all achievements in a grouped grid.
 *
 * Groups achievements by rarity (Legendary, Rare, Common).
 * Shows a progress bar, locked/unlocked states, and rarity badges.
 */

import { useNavigate } from "react-router-dom";
import { loadAchievements } from "../engine/storage";
import { ACHIEVEMENTS } from "../engine/achievements";

/** Rarity display order and labels */
const RARITY_ORDER = ["legendary", "rare", "common"];
const RARITY_LABELS = {
  legendary: "Legendary",
  rare: "Rare",
  common: "Common",
};

export default function Achievements() {
  const nav = useNavigate();
  const unlocked = new Set(loadAchievements());

  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  /** Group achievements by rarity */
  const groups = {};
  for (const ach of ACHIEVEMENTS) {
    const r = ach.rarity;
    if (!groups[r]) groups[r] = [];
    groups[r].push(ach);
  }

  return (
    <>
      <div className="trophy-bg" />

      <div className="shell">
        <div className="trophy-page">
          {/* Header */}
          <div className="trophy-header">
            <button className="btn-icon" onClick={() => nav(-1)}>
              Back
            </button>
            <h1 className="trophy-title">Trophy Case</h1>
          </div>

          {/* Progress bar */}
          <div className="trophy-progress">
            <div className="trophy-progress-label">
              <span className="trophy-progress-count">
                {unlockedCount} / {totalCount}
              </span>
              <span className="trophy-progress-pct">{pct}%</span>
            </div>
            <div className="trophy-progress-bar">
              <div
                className="trophy-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Achievement groups by rarity */}
          {RARITY_ORDER.map((rarity) => {
            const items = groups[rarity];
            if (!items || items.length === 0) return null;

            return (
              <div key={rarity} className="trophy-group">
                <div className="trophy-group-label">
                  {RARITY_LABELS[rarity]}
                </div>
                <div className="trophy-grid">
                  {items.map((ach) => {
                    const isUnlocked = unlocked.has(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`trophy-card ${isUnlocked ? "unlocked" : "locked"} rarity-${ach.rarity}`}
                      >
                        <div className="trophy-card-top">
                          <span className="trophy-icon">
                            {isUnlocked ? ach.icon : "\u{1F512}"}
                          </span>
                          <div className="trophy-card-info">
                            <span className="trophy-card-title">
                              {isUnlocked ? ach.title : "???"}
                            </span>
                            <span className="trophy-card-desc">
                              {ach.description}
                            </span>
                          </div>
                        </div>
                        <span className={`trophy-rarity ${ach.rarity}`}>
                          {RARITY_LABELS[ach.rarity]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
