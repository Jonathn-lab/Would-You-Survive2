import { useNavigate } from "react-router-dom";
import { clearZombieRun } from "../engine/storage";
import { useState, useEffect } from "react";

const SETTINGS_KEY = "wys2_settings";

const defaultSettings = {
  textSpeed: "normal",
  autoSave: true,
  showNodeId: false,
  screenShake: true,
  confirmChoices: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

function persistSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function Settings() {
  const nav = useNavigate();
  const [settings, setSettings] = useState(loadSettings);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  function toggle(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  function handleClearData() {
    clearZombieRun();
    localStorage.removeItem("wys2_username");
    setCleared(true);
  }

  return (
    <>
      <div className="settings-bg" />
      <div className="shell">
        <div className="settings-page">
          <div className="settings-header">
            <button className="btn-icon" onClick={() => nav("/")}>
              Back
            </button>
            <h1 className="settings-title">Settings</h1>
          </div>

          {/* Gameplay */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Gameplay</div>

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

          {/* Display */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Display</div>

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

          {/* Data */}
          <div className="settings-section">
            <div className="settings-card">
              <div className="settings-card-header">Data</div>

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

          {/* About */}
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
