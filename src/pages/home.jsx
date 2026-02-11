import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadZombieRun } from "../engine/storage";

const USERNAME_KEY = "wys2_username";

export default function Home() {
  const nav = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) ?? "");
  const hasSave = !!loadZombieRun();

  useEffect(() => {
    if (username) localStorage.setItem(USERNAME_KEY, username);
  }, [username]);

  function handlePlay() {
    if (!username.trim()) return;
    localStorage.setItem(USERNAME_KEY, username.trim());
    nav("/stories");
  }

  function handleLoad() {
    const save = loadZombieRun();
    if (!save) return;
    const story = save.story || "zombie";
    const act = save.lastEnd?.type === "act_complete" ? "2" : (save.act || "1");
    nav(`/play?story=${story}&act=${act}`, { state: { carry: save.carry } });
  }

  return (
    <>
      <div className="home-bg" />
      <div className="shell">
        <div className="home-container">
          <h1 className="home-logo">WYS</h1>
          <p className="home-tagline">Would You Survive</p>
          <p className="home-desc">
            A choice-driven survival story. Every decision shapes your fate.
            Not everyone makes it out.
          </p>

          <div className="home-card">
            <h2>Begin</h2>

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

            <div className="home-actions">
              <button
                className="btn-primary"
                onClick={handlePlay}
                disabled={!username.trim()}
              >
                New Game
              </button>

              <div className="home-divider" />

              <div className="btn-row">
                <button
                  className="btn-secondary"
                  onClick={handleLoad}
                  disabled={!hasSave}
                  title={hasSave ? "Continue from your last save" : "No save data found"}
                >
                  Load Save
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => nav("/settings")}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>

          <p className="home-footer">v2.0 — Three Storylines</p>
        </div>
      </div>
    </>
  );
}
