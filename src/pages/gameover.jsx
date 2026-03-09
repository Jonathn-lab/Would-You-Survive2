/**
 * gameover.jsx
 * The game-over / end-of-act summary page.
 *
 * Displays a themed ending screen with the ending title, reason,
 * final stats, inventory, and a readable journey summary.
 *
 * Ending types style differently:
 *   - "act_complete" → green/triumphant tone, continue option
 *   - "dead"         → red/dramatic tone
 *   - "infected"     → amber/ominous tone
 *
 * Receives data via React Router's location.state:
 *   - end:     The ending object ({ type, title, reason }).
 *   - final:   The final game state (stats, inventory, flags, history).
 *   - storyId: Which story was played.
 *   - act:     Which act number was completed.
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { saveGame } from "../engine/storage";
import { getNode } from "../engine/storyEngine";
import stories from "../data/stories";

/** Map ending types to accent colors and labels */
const ENDING_THEMES = {
  act_complete: { color: "#34d67b", label: "Act Complete", icon: "\u2713" },
  dead:         { color: "#c23a3a", label: "You Died",     icon: "\u2620" },
  infected:     { color: "#e8a33a", label: "Infected",     icon: "\u26A0" },
};

const DEFAULT_THEME = { color: "#5e6d85", label: "The End", icon: "\u2014" };

export default function GameOver() {
  const { state } = useLocation();
  const nav = useNavigate();

  const end = state?.end;
  const final = state?.final;
  const storyId = state?.storyId || "zombie";
  const act = state?.act || "1";

  const [saved, setSaved] = useState(false);

  if (!end) {
    return (
      <div className="shell">
        <h1>Game Over</h1>
        <p className="muted">No ending data found. Start a new run.</p>
        <Link className="btn" to="/">Home</Link>
      </div>
    );
  }

  const storyMeta = stories[storyId];
  const story = storyMeta?.acts?.[act];
  const isActComplete = end.type === "act_complete";
  const nextAct = String(Number(act) + 1);
  const hasNextAct = storyMeta?.acts?.[nextAct];
  const endTheme = ENDING_THEMES[end.type] || DEFAULT_THEME;

  /** Resolve history entries to readable choice labels */
  const journeySteps = (final?.history ?? []).map(entry => {
    if (!story) return null;
    const histNode = getNode(story, entry.nodeId);
    const choice = histNode?.choices?.find(c => c.id === entry.choiceId);
    return choice?.label ?? null;
  }).filter(Boolean);

  function handleSave() {
    saveGame({
      savedAt: Date.now(),
      carry: final,
      lastEnd: end,
      story: storyId,
      act
    });
    setSaved(true);
  }

  return (
    <>
      {/* Themed background */}
      <div className="gameover-bg" style={{
        background: `radial-gradient(ellipse at 50% 20%, ${endTheme.color}18 0%, transparent 55%), radial-gradient(ellipse at 30% 80%, ${endTheme.color}08 0%, transparent 45%), linear-gradient(180deg, #0a0d14 0%, #0e1118 50%, #0c0f18 100%)`
      }} />

      <div className="shell">
        <div className="gameover-container">

          {/* Ending type badge */}
          <span className="gameover-badge gameover-stagger" style={{
            color: endTheme.color,
            background: `${endTheme.color}12`,
            borderColor: `${endTheme.color}25`,
          }}>
            {endTheme.label}
          </span>

          {/* Title */}
          <h1 className="gameover-title gameover-stagger" style={{ color: endTheme.color, animationDelay: "0.1s" }}>
            {end.title}
          </h1>

          {/* Reason */}
          <p className="gameover-reason gameover-stagger" style={{ animationDelay: "0.2s" }}>{end.reason}</p>

          {/* Story context */}
          <div className="gameover-meta gameover-stagger" style={{ animationDelay: "0.25s" }}>
            <span className="muted">{storyMeta?.title}</span>
            <span className="muted">&middot;</span>
            <span className="muted">Act {act}</span>
          </div>

          {/* Stats card */}
          <div className="gameover-card gameover-stagger" style={{ animationDelay: "0.35s" }}>
            <span className="gameover-section-label">Final Stats</span>
            <div className="gameover-stats">
              <div className="stat-pill health">
                <span className="pillLabel">Health</span>
                <span className="pillValue">{final?.stats?.health ?? 0}</span>
              </div>
              <div className="stat-pill stamina">
                <span className="pillLabel">Stamina</span>
                <span className="pillValue">{final?.stats?.stamina ?? 0}</span>
              </div>
              <div className="stat-pill stress">
                <span className="pillLabel">Stress</span>
                <span className="pillValue">{final?.stats?.stress ?? 0}</span>
              </div>
            </div>

            {/* Inventory */}
            {(final?.inventory ?? []).length > 0 && (
              <>
                <span className="gameover-section-label" style={{ marginTop: 20 }}>
                  Inventory
                </span>
                <div className="chips">
                  {final.inventory.map((i) => (
                    <span key={i} className="chip">{i}</span>
                  ))}
                </div>
              </>
            )}

            {/* Journey summary — readable choice labels */}
            {journeySteps.length > 0 && (
              <>
                <span className="gameover-section-label" style={{ marginTop: 20 }}>
                  Your Journey
                </span>
                <div className="gameover-journey">
                  {journeySteps.map((label, idx) => (
                    <div key={idx} className="gameover-journey-step">
                      <span className="gameover-step-num">{idx + 1}</span>
                      <span className="gameover-step-label">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Coming Soon — shown when completing the final act */}
          {isActComplete && !hasNextAct && (
            <div className="coming-soon-card" style={{ borderColor: `${storyMeta?.color || endTheme.color}25` }}>
              <div className="coming-soon-glow" style={{
                background: `radial-gradient(circle, ${storyMeta?.color || endTheme.color}10 0%, transparent 70%)`
              }} />
              <span className="coming-soon-label">To Be Continued</span>
              <span className="coming-soon-title" style={{ color: storyMeta?.color || endTheme.color }}>
                Act {nextAct} — Coming Soon
              </span>
              <p className="coming-soon-desc">
                Your story isn't over yet. The next chapter is being written.
                Save your run so you're ready when it drops.
              </p>
              <button
                className={`btn-secondary coming-soon-save${saved ? " pause-saved" : ""}`}
                onClick={handleSave}
                disabled={saved}
              >
                {saved ? "Run Saved!" : "Save Run for Act " + nextAct}
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="gameover-actions gameover-stagger" style={{ animationDelay: "0.45s" }}>
            {/* Act complete with next act → continue as primary */}
            {isActComplete && hasNextAct && (
              <button
                className="btn-primary"
                onClick={() => nav(`/play?story=${storyId}&act=${nextAct}`, { state: { carry: final } })}
              >
                Continue to Act {nextAct}
              </button>
            )}

            {/* Death/infection → "Try Again" is primary */}
            {!isActComplete && (
              <Link className="btn-primary" to={`/play?story=${storyId}&act=${act}`}
                style={{ textDecoration: "none" }}>
                Try Again
              </Link>
            )}

            <div className="btn-row">
              <Link className="btn-secondary" to={`/play?story=${storyId}&act=1`}
                style={{ textDecoration: "none" }}>
                Restart Story
              </Link>

              {isActComplete && hasNextAct && (
                <button
                  className={`btn-secondary${saved ? " pause-saved" : ""}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  {saved ? "Saved!" : "Save Run"}
                </button>
              )}

              <Link className="btn-secondary" to="/stories" style={{ textDecoration: "none" }}>
                Other Stories
              </Link>

              <Link className="btn-secondary" to="/" style={{ textDecoration: "none" }}>
                Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
