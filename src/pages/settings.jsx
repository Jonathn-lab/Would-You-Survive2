/**
 * settings.jsx
 * The settings page where players can configure gameplay preferences,
 * display options, and manage their saved data.
 *
 * Settings are persisted to localStorage under the "wys2_settings" key.
 * Available settings:
 *   - textSpeed:       How fast story text appears (slow/normal/fast/instant).
 *   - autoSave:        Whether progress is saved automatically at each node.
 *   - showNodeId:      Debug option to display story node identifiers.
 *   - screenShake:     Visual feedback on stat changes.
 *   - confirmChoices:  Whether to show a confirmation before making a choice.
 *
 * Also provides a "Clear All Data" button to wipe saves, username, and settings.
 */

import { useNavigate } from "react-router-dom";
import { clearGame } from "../engine/storage";
import { useState, useEffect } from "react";

/** localStorage key for persisting settings */
const SETTINGS_KEY = "wys2_settings";

/** Default values for all settings options */
const defaultSettings = {
  textSpeed: "normal",
  autoSave: true,
  showNodeId: false,
  screenShake: true,
  confirmChoices: false,
  soundEnabled: true,
};

/**
 * loadSettings - Read settings from localStorage and merge with defaults.
 * Falls back to defaults if localStorage is empty or contains invalid JSON.
 * @returns {object} The merged settings object.
 */
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

/**
 * persistSettings - Write the current settings object to localStorage.
 * @param {object} s - The settings object to persist.
 */
function persistSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function Settings() {
  const nav = useNavigate();

  /* Load settings from localStorage on mount */
  const [settings, setSettings] = useState(loadSettings);
  /* Track whether data has been cleared to disable the button */
  const [cleared, setCleared] = useState(false);

  /**
   * Effect: Auto-persist settings to localStorage whenever they change.
   */
  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  /**
   * toggle - Flip a boolean setting by key.
   * @param {string} key - The settings key to toggle (e.g. "autoSave").
   */
  function toggle(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  /**
   * handleClearData - Wipe all app data from localStorage.
   * Removes the save file, username, and marks the action as complete.
   * Note: Settings themselves are NOT cleared here (just the save + username).
   */
  function handleClearData() {
    clearGame();
    localStorage.removeItem("wys2_username");
    setCleared(true);
  }

  return (
    <>
      {/* Subtle gradient background for the settings page */}
      <div className="settings-bg" />
      <div className="shell">
        <div className="settings-page">
          {/* Header with back button and page title */}
          <div className="settings-header">
            <button className="btn-icon" onClick={() => nav("/")}>
              Back
            </button>
            <h1 className="settings-title">Settings</h1>
          </div>

          {/* ===== Gameplay Settings Section ===== */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Gameplay</div>

              {/* Text Speed - dropdown select */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Text Speed</span>
                  <span className="settings-row-desc">How fast story text appears</span>
                </div>
                <select
                  className="settings-select"
                  value={settings.textSpeed}
                  onChange={(e) => setSettings((s) => ({ ...s, textSpeed: e.target.value }))}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="instant">Instant</option>
                </select>
              </div>

              {/* Confirm Choices - toggle switch */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Confirm Choices</span>
                  <span className="settings-row-desc">Ask for confirmation before making a choice</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.confirmChoices} onChange={() => toggle("confirmChoices")} />
                  <span className="toggle-track" />
                </label>
              </div>

              {/* Auto Save - toggle switch */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Auto Save</span>
                  <span className="settings-row-desc">Automatically save progress at each node</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.autoSave} onChange={() => toggle("autoSave")} />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </div>

          {/* ===== Display Settings Section ===== */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Display</div>

              {/* Sound Effects - toggle switch */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Sound Effects</span>
                  <span className="settings-row-desc">Play synthesized audio feedback</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.soundEnabled !== false} onChange={() => toggle("soundEnabled")} />
                  <span className="toggle-track" />
                </label>
              </div>

              {/* Screen Effects - toggle switch */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Screen Effects</span>
                  <span className="settings-row-desc">Visual feedback on stat changes</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.screenShake} onChange={() => toggle("screenShake")} />
                  <span className="toggle-track" />
                </label>
              </div>

              {/* Show Node IDs - toggle switch (debug feature) */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Show Node IDs</span>
                  <span className="settings-row-desc">Display story node identifiers (debug)</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.showNodeId} onChange={() => toggle("showNodeId")} />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </div>

          {/* ===== Data Management Section ===== */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Data</div>

              {/* Clear All Data - destructive action button */}
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-title">Clear All Data</span>
                  <span className="settings-row-desc">Wipe saves, username, and settings from this browser</span>
                </div>
                <button
                  className="btn-danger"
                  onClick={handleClearData}
                  disabled={cleared}
                  style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                >
                  {cleared ? "Cleared" : "Clear"}
                </button>
              </div>
            </div>
          </div>

          {/* ===== About Section ===== */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">About</div>
              <div className="settings-row" style={{ borderTop: "none" }}>
                <div className="settings-row-label">
                  <span className="settings-row-title">WYS 2.0</span>
                  <span className="settings-row-desc">A choice-driven survival story. Choices hurt. Sometimes literally.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
