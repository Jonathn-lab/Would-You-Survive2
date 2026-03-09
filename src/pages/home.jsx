/**
 * home.jsx
 * The landing / home page of the WYS 2.0 application.
 *
 * Features:
 *   - Username input field (persisted to localStorage).
 *   - "New Game" button that navigates to the story selection screen.
 *   - "Load Save" button that resumes a previously saved run from localStorage.
 *   - "Settings" button to open the settings page.
 *
 * The username is stored under the "wys2_username" key in localStorage
 * and is displayed during gameplay in the topbar.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadGame } from "../engine/storage";

/** localStorage key for the player's chosen username */
const USERNAME_KEY = "wys2_username";

export default function Home() {
  const nav = useNavigate();

  /* Initialize username from localStorage; empty string if none saved */
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) ?? "");

  /* Check if a save file exists to enable/disable the "Load Save" button */
  const hasSave = !!loadGame();

  /**
   * Effect: Persist username to localStorage whenever it changes.
   * Only writes if the username is non-empty to avoid storing blank values.
   */
  useEffect(() => {
    if (username) localStorage.setItem(USERNAME_KEY, username);
  }, [username]);

  /**
   * handlePlay - Start a new game.
   * Requires a non-empty username. Navigates to the story selection screen.
   */
  function handlePlay() {
    if (!username.trim()) return;
    localStorage.setItem(USERNAME_KEY, username.trim());
    nav("/stories");
  }

  /**
   * handleLoad - Resume a saved game.
   * Loads the save data from localStorage and navigates to the correct story/act.
   * If the last ending was an act completion, it resumes at the next act.
   */
  function handleLoad() {
    const save = loadGame();
    if (!save) return;
    const story = save.story || "zombie";
    const act = save.lastEnd?.type === "act_complete" ? String(Number(save.act || "1") + 1) : (save.act || "1");
    nav(`/play?story=${story}&act=${act}`, { state: { carry: save.carry } });
  }

  return (
    <>
      {/* Atmospheric gradient background for the home screen */}
      <div className="home-bg" />

      <div className="shell">
        <div className="home-container">
          {/* Large logo title */}
          <h1 className="home-logo">WYS</h1>
          {/* Subtitle tagline */}
          <p className="home-tagline">Would You Survive</p>
          {/* Brief description of the game */}
          <p className="home-desc">
            A choice-driven survival story. Every decision shapes your fate.
            Not everyone makes it out.
          </p>

          {/* Main action card containing name input and buttons */}
          <div className="home-card">
            <h2>Begin</h2>

            {/* Username text input field */}
            <div className="input-group">
              <label className="input-label" htmlFor="username">Survivor Name</label>
              <input
                id="username"
                className="input-field"
                type="text"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlay()}
                maxLength={24}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Action buttons: New Game, Load Save, Settings */}
            <div className="home-actions">
              {/* Primary button - starts a new game (disabled if no username) */}
              <button
                className="btn-primary"
                onClick={handlePlay}
                disabled={!username.trim()}
              >
                New Game
              </button>

              {/* Visual divider line between primary and secondary actions */}
              <div className="home-divider" />

              {/* Secondary buttons row */}
              <div className="btn-row">
                {/* Load an existing save from localStorage */}
                <button
                  className="btn-secondary"
                  onClick={handleLoad}
                  disabled={!hasSave}
                  title={hasSave ? "Continue from your last save" : "No save data found"}
                >
                  Load Save
                </button>

                {/* Navigate to the settings page */}
                <button
                  className="btn-secondary"
                  onClick={() => nav("/settings")}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Version footer */}
          <p className="home-footer">v2.0 — Three Storylines</p>
        </div>
      </div>
    </>
  );
}
