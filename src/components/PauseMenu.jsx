/**
 * PauseMenu.jsx
 * Full-screen overlay pause menu with Resume, Save, inline Settings, and Quit.
 *
 * Props:
 *   - isOpen:      Boolean controlling visibility.
 *   - onResume:    Close the menu and continue playing.
 *   - onSave:      Trigger a game save (returns void).
 *   - onQuit:      Navigate back to the home screen.
 *   - storyTitle:  Current story name for the header.
 *   - act:         Current act number string.
 *   - accentColor: Story accent hex for theming.
 */

import { useState, useEffect, useCallback } from "react";

const SETTINGS_KEY = "wys2_settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function PauseMenu({ isOpen, onResume, onSave, onQuit, storyTitle, act, accentColor }) {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState(loadSettings);

  /* Sync settings when menu opens */
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      setSettings(loadSettings());
      setSaved(false);
    });
  }, [isOpen]);

  /* Persist settings on change */
  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  /* ESC to close */
  const handleKey = useCallback((e) => {
    if (e.code === "Escape") onResume();
  }, [onResume]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  function handleSave() {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleSetting(key) {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  }

  if (!isOpen) return null;

  return (
    <div className="pause-overlay" onClick={onResume}>
      <div className="pause-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pause-header">
          <span className="pause-title">Paused</span>
          <span className="pause-meta">
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
            <span className="muted">{storyTitle}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="pause-actions">
          <button className="btn-primary" onClick={onResume}>
            Resume
          </button>
          <button className={`btn-secondary${saved ? " pause-saved" : ""}`} onClick={handleSave}>
            {saved ? "Saved!" : "Save Game"}
          </button>
        </div>

        {/* Inline Settings */}
        <div className="pause-divider" />
        <div className="pause-settings">
          <span className="pause-settings-label">Settings</span>

          <div className="pause-setting-row">
            <span className="pause-setting-name">Text Speed</span>
            <select
              className="settings-select"
              value={settings.textSpeed ?? "normal"}
              onChange={(e) => setSettings(s => ({ ...s, textSpeed: e.target.value }))}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
              <option value="instant">Instant</option>
            </select>
          </div>

          <div className="pause-setting-row">
            <span className="pause-setting-name">Screen Effects</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.screenShake !== false}
                onChange={() => toggleSetting("screenShake")}
              />
              <span className="toggle-track" />
            </label>
          </div>

          <div className="pause-setting-row">
            <span className="pause-setting-name">Auto Save</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.autoSave !== false}
                onChange={() => toggleSetting("autoSave")}
              />
              <span className="toggle-track" />
            </label>
          </div>
        </div>

        {/* Quit */}
        <div className="pause-divider" />
        <button className="btn-danger pause-quit" onClick={onQuit}>
          Quit to Menu
        </button>
      </div>
    </div>
  );
}
