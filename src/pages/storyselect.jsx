/**
 * storyselect.jsx
 * The story selection page where players choose which story to play.
 *
 * Displays a grid of available stories from the stories registry.
 * Each story card shows the title, subtitle (genre), description, act count,
 * and uses the story's theme color for accent styling via CSS custom properties.
 *
 * Clicking a story card navigates to /play?story=<id>&act=1 to start Act 1.
 */

import { useNavigate } from "react-router-dom";
import { loadGame } from "../engine/storage";
import stories from "../data/stories";

/** Convert the stories object into an array for iteration */
const storyList = Object.values(stories);

export default function StorySelect() {
  const nav = useNavigate();

  /* Read the player's chosen username from localStorage for the header display */
  const username = localStorage.getItem("wys2_username") || "Survivor";

  /* Check which story was last played */
  const save = loadGame();
  const lastPlayedStory = save?.story ?? null;

  /**
   * handleSelect - Navigate to the gameplay screen for the chosen story.
   * Always starts at Act 1 for a fresh playthrough.
   * @param {string} storyId - The unique identifier of the selected story.
   */
  function handleSelect(storyId) {
    nav(`/play?story=${storyId}&act=1`);
  }

  return (
    <>
      {/* Multi-gradient background blending all story theme colors */}
      <div className="select-bg" />

      <div className="shell">
        <div className="select-container">
          {/* Header with back navigation and page title */}
          <div className="select-header">
            <button className="btn-icon" onClick={() => nav("/")}>Back</button>
            <div>
              <h1 className="select-title">Choose Your Story</h1>
              <p className="muted">Playing as <strong>{username}</strong></p>
            </div>
          </div>

          {/* Grid of story selection cards */}
          <div className="story-grid">
            {storyList.map((s, idx) => (
              <button
                key={s.id}
                className="story-select-card story-card-enter"
                onClick={() => handleSelect(s.id)}
                style={{
                  "--story-color": s.color,
                  animationDelay: `${idx * 0.08}s`,
                }}
              >
                {/* Left-edge colored accent bar */}
                <div className="story-select-accent" />

                <div className="story-select-content">
                  {/* Genre/subtitle badge (e.g. "Suburban Survival") */}
                  <span className="story-select-badge">{s.subtitle}</span>
                  {/* Story title */}
                  <h2 className="story-select-title">{s.title}</h2>
                  {/* Story description */}
                  <p className="story-select-desc">{s.description}</p>
                  {/* Metadata: number of acts available + recently played */}
                  <div className="story-select-meta">
                    <span>{s.actCount} Acts</span>
                    {lastPlayedStory === s.id && (
                      <span className="story-recent-badge">Recently Played</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
