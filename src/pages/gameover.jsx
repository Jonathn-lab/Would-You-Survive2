import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { saveZombieRun } from "../engine/storage";

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

  const isActComplete = end.type === "act_complete";
  const nextAct = String(Number(act) + 1);

  function handleSave() {
    saveZombieRun({
      savedAt: Date.now(),
      carry: final,
      lastEnd: end,
      story: storyId,
      act
    });
    setSaved(true);
  }

  return (
    <div className="shell">
      <h1>{end.title}</h1>
      <p className="muted">{end.reason}</p>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Final Stats</h2>
        <div className="statsLine">
          <span>Health: <b>{final?.stats?.health ?? "-"}</b></span>
          <span>Stamina: <b>{final?.stats?.stamina ?? "-"}</b></span>
          <span>Stress: <b>{final?.stats?.stress ?? "-"}</b></span>
        </div>

        <h3 style={{ marginTop: 16 }}>Inventory</h3>
        <div className="chips">
          {(final?.inventory ?? []).length ? (
            final.inventory.map((i) => (
              <span key={i} className="chip">{i}</span>
            ))
          ) : (
            <span className="muted">Empty</span>
          )}
        </div>

        <h3 style={{ marginTop: 16 }}>Run History</h3>
        <ol className="history">
          {(final?.history ?? []).length ? (
            final.history.map((h, idx) => (
              <li key={idx}>
                <code>{h.nodeId}</code> → <code>{h.choiceId}</code>
              </li>
            ))
          ) : (
            <li className="muted">No recorded choices.</li>
          )}
        </ol>

        <div className="row" style={{ marginTop: 16 }}>
          <Link className="btn" to={`/play?story=${storyId}&act=1`}>Play Again</Link>
          <Link className="btn ghost" to="/">Home</Link>
        </div>

        {isActComplete && (
          <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
            <button className="btn" onClick={handleSave} disabled={saved}>
              {saved ? "Saved" : "Save Run"}
            </button>

            <button
              className="btn"
              onClick={() => nav(`/play?story=${storyId}&act=${nextAct}`, { state: { carry: final } })}
            >
              Continue to Act {nextAct}
            </button>

            {saved && <span className="muted">Saved to localStorage.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
