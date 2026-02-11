import { useEffect, useMemo, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import stories from "../data/stories";
import { gameReducer, initialState } from "../engine/gameReducer";
import { getNode, meetsRequirement } from "../engine/storyEngine";
import { saveZombieRun } from "../engine/storage";

import ChoiceButton from "../components/ChoiceButton";

export default function Game() {
  const nav = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const storyId = params.get("story") ?? "zombie";
  const act = params.get("act") ?? "1";

  const storyMeta = stories[storyId];
  const story = storyMeta?.acts?.[act];

  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (!story) return;
    const carry = location.state?.carry ?? null;
    dispatch({
      type: "START_GAME",
      payload: {
        storyId: story.meta.id,
        startNodeId: story.meta.startNodeId,
        carry
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, act]);

  const node = useMemo(() => story ? getNode(story, state.nodeId) : null, [story, state.nodeId]);

  useEffect(() => {
    if (!node) return;

    if (node.onEnter?.length && !state.visitedNodes[node.id]) {
      dispatch({ type: "APPLY_EFFECTS", payload: { effects: node.onEnter } });
      dispatch({ type: "MARK_VISITED", payload: { nodeId: node.id } });
    }

    if (node.end) {
      nav("/game-over", { state: { end: node.end, final: state, storyId, act } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nodeId, node?.id]);

  if (!storyMeta || !story) {
    return (
      <div className="shell">
        <p>Story not found.</p>
        <button className="btn-secondary" onClick={() => nav("/stories")} style={{ width: "auto", marginTop: 16 }}>
          Back to Stories
        </button>
      </div>
    );
  }

  if (!node) return <div className="shell">Loading story...</div>;

  const availableChoices = (node.choices ?? []).filter((c) =>
    meetsRequirement(state, c.requirement)
  );

  function handleChoice(choice) {
    dispatch({ type: "ADD_HISTORY", payload: { nodeId: node.id, choiceId: choice.id } });
    if (choice.effects?.length) {
      dispatch({ type: "APPLY_EFFECTS", payload: { effects: choice.effects } });
    }
    dispatch({ type: "SET_NODE", payload: { nodeId: choice.to } });
  }

  function handleSave() {
    saveZombieRun({
      savedAt: Date.now(),
      carry: state,
      lastEnd: null,
      story: storyId,
      act
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  function handleMenu() {
    nav("/");
  }

  const username = localStorage.getItem("wys2_username") || "Survivor";
  const accentColor = storyMeta.color || "#c23a3a";

  return (
    <>
      <div className="play-bg" style={{
        background: `radial-gradient(ellipse at 30% 20%, ${accentColor}15 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${accentColor}08 0%, transparent 45%), linear-gradient(180deg, #0a0d14 0%, #0e1118 50%, #0c0f18 100%)`
      }} />
      <div className="play-shell">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="title">{username}</h1>
            <div className="topbar-meta">
              <span className="act-badge" style={{ background: `${accentColor}20`, borderColor: `${accentColor}35`, color: accentColor }}>
                Act {act}
              </span>
              <span className="muted">{storyMeta.title}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className={`btn-icon${showToast ? " saved" : ""}`} onClick={handleSave}>
              Save
            </button>
            <button className="btn-icon" onClick={handleMenu}>
              Menu
            </button>
          </div>
        </header>

        <div className="stats-bar">
          <div className="stat-pill health">
            <span className="pillLabel">Health</span>
            <span className="pillValue">{state.stats.health}</span>
          </div>
          <div className="stat-pill stamina">
            <span className="pillLabel">Stamina</span>
            <span className="pillValue">{state.stats.stamina}</span>
          </div>
          <div className="stat-pill stress">
            <span className="pillLabel">Stress</span>
            <span className="pillValue">{state.stats.stress}</span>
          </div>
        </div>

        <div className="story-card">
          <p className="storyText">{node.text}</p>

          <div className="choices">
            {availableChoices.map((c) => (
              <ChoiceButton key={c.id} onClick={() => handleChoice(c)}>
                {c.label}
              </ChoiceButton>
            ))}
          </div>

          <div className="inventory-section">
            <div className="inventory-label">Inventory</div>
            <div className="chips">
              {state.inventory.length ? (
                state.inventory.map((i) => (
                  <span key={i} className="chip">{i}</span>
                ))
              ) : (
                <span className="muted">Empty</span>
              )}
            </div>
          </div>
        </div>

        <div className={`save-toast${showToast ? " show" : ""}`}>
          Game saved
        </div>
      </div>
    </>
  );
}
