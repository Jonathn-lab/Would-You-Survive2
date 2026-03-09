/**
 * game.jsx
 * The main gameplay page. Loads a story act, manages game state via useReducer,
 * renders the current story node text, available choices, stats, and inventory.
 *
 * Features:
 *   - Typewriter text reveal (respects text speed setting)
 *   - Stat change animations (floating deltas, pill shake)
 *   - Screen vignette effects (damage flash, stress pulse)
 *   - Synthesized sound effects (click, damage, stress, item gain)
 *   - Timed choices (optional per-node countdown, auto-selects last choice)
 *   - Choice consequence transition (brief card pulse between nodes)
 *   - Keyboard shortcuts (1-4 choices, Space skip, Esc pause)
 *   - Locked choices with requirement hints
 *   - Auto-save (wired to settings toggle)
 *   - Pause menu overlay with inline settings
 *   - Story recap on save load
 *
 * URL query params:
 *   ?story=<storyId>  - which story to play (default: "zombie")
 *   &act=<actNumber>  - which act of the story (default: "1")
 */

import { useEffect, useMemo, useReducer, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import stories from "../data/stories";
import { gameReducer, initialState } from "../engine/gameReducer";
import { getNode, meetsRequirement, getRequirementHint } from "../engine/storyEngine";
import { saveGame, loadGame } from "../engine/storage";
import { useTypewriter } from "../hooks/useTypewriter";
import {
  playClick,
  playDamage,
  playStress,
  playItemGain,
  playTimerTick,
  playTimerExpire
} from "../engine/sounds";

import ChoiceButton from "../components/ChoiceButton";
import AmbientBackground from "../components/AmbientBackground";
import PauseMenu from "../components/PauseMenu";
import RecapModal from "../components/RecapModal";


/** Read settings from localStorage */
const SETTINGS_KEY = "wys2_settings";
function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

export default function Game() {
  const nav = useNavigate();
  const location = useLocation();

  /* ---- Core UI state ---- */
  const [showToast, setShowToast] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  /* ---- Screen effects state ---- */
  const [vignette, setVignette] = useState(null);
  const [statDeltas, setStatDeltas] = useState({});
  const [shaking, setShaking] = useState({});

  /* ---- Timer state ---- */
  const [timerLeft, setTimerLeft] = useState(null);
  const [timerTotal, setTimerTotal] = useState(null);

  /* ---- Refs ---- */
  const prevStatsRef = useRef(null);
  const prevInvRef = useRef([]);
  const timerRef = useRef(null);
  const transRef = useRef(null);
  const tickSoundRef = useRef(0);
  const autoSaveSkipRef = useRef(true);
  const isLoadedSaveRef = useRef(false);
  const storyCardRef = useRef(null);

  /* ---- Parse URL params ---- */
  const params = new URLSearchParams(window.location.search);
  const storyId = params.get("story") ?? "zombie";
  const act = params.get("act") ?? "1";

  /* ---- Story lookup ---- */
  const storyMeta = stories[storyId];
  const story = storyMeta?.acts?.[act];

  /* ---- Game state ---- */
  const [state, dispatch] = useReducer(gameReducer, initialState);

  /* ---- Settings (re-read on each render to pick up pause menu changes) ---- */
  const settings = getSettings();
  const textSpeed = settings.textSpeed ?? "normal";
  const screenEffects = settings.screenShake !== false;
  const autoSave = settings.autoSave !== false;

  /**
   * Initialize or restart the game when the story/act changes.
   */
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
    prevStatsRef.current = null;
    prevInvRef.current = carry?.inventory ?? [];
    autoSaveSkipRef.current = true;

    if (carry) {
      isLoadedSaveRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, act]);

  /**
   * Show recap modal after game initializes from a loaded save.
   */
  useEffect(() => {
    if (isLoadedSaveRef.current && state.nodeId) {
      setShowRecap(true);
      isLoadedSaveRef.current = false;
    }
  }, [state.nodeId]);

  /**
   * Derive the current story node.
   */
  const node = useMemo(
    () => (story ? getNode(story, state.nodeId) : null),
    [story, state.nodeId]
  );

  /**
   * Typewriter — paused when pause menu or recap is open.
   */
  const typewriterText = (transitioning || pauseOpen || showRecap) ? "" : (node?.text ?? "");
  const { displayed, done: typewriterDone, skip: skipTypewriter } = useTypewriter(
    typewriterText,
    textSpeed
  );

  /**
   * All choices for current node, and which are available.
   */
  const allChoices = useMemo(() => node?.choices ?? [], [node]);
  const availableChoices = useMemo(
    () => allChoices.filter((c) => meetsRequirement(state, c.requirement)),
    [allChoices, state]
  );

  /**
   * Build recap data from history.
   */
  const recapData = useMemo(() => {
    if (!story || !state.history.length) return [];
    return state.history.slice(-5).map(entry => {
      const histNode = getNode(story, entry.nodeId);
      const choice = histNode?.choices?.find(c => c.id === entry.choiceId);
      return { choiceLabel: choice?.label ?? "..." };
    }).filter(r => r.choiceLabel);
  }, [story, state.history]);

  const savedAt = useMemo(() => {
    const save = loadGame();
    return save?.savedAt ?? null;
  }, []);

  /**
   * Detect stat changes → trigger floating deltas, shake, vignette, sounds.
   */
  useEffect(() => {
    if (!prevStatsRef.current) {
      prevStatsRef.current = { ...state.stats };
      return;
    }

    const prev = prevStatsRef.current;
    const deltas = {};
    let hasChange = false;

    for (const key of Object.keys(state.stats)) {
      const d = state.stats[key] - (prev[key] ?? 0);
      if (d !== 0) {
        deltas[key] = d;
        hasChange = true;
      }
    }

    if (hasChange) {
      setStatDeltas(deltas);
      setShaking(Object.fromEntries(Object.keys(deltas).map(k => [k, true])));

      if (screenEffects) {
        if (deltas.health < 0) {
          setVignette("damage");
          playDamage();
        } else if (deltas.stress > 0) {
          setVignette("stress");
          playStress();
        }
      }

      setTimeout(() => {
        setStatDeltas({});
        setShaking({});
        setVignette(null);
      }, 1000);
    }

    prevStatsRef.current = { ...state.stats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stats]);

  /**
   * Detect inventory additions → play item gain sound.
   */
  useEffect(() => {
    if (state.inventory.length > prevInvRef.current.length) {
      playItemGain();
    }
    prevInvRef.current = [...state.inventory];
  }, [state.inventory]);

  /**
   * Node-enter logic: onEnter effects and end-of-story detection.
   */
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

  /**
   * Scroll to story card on node change (helpful on mobile).
   */
  useEffect(() => {
    if (!node || !storyCardRef.current) return;
    storyCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.nodeId, node?.id]);

  /**
   * Auto-save — silently saves after each node change (skips first mount).
   */
  useEffect(() => {
    if (!autoSave || !state.storyId) return;
    if (autoSaveSkipRef.current) {
      autoSaveSkipRef.current = false;
      return;
    }
    saveGame({
      savedAt: Date.now(),
      carry: state,
      lastEnd: null,
      story: storyId,
      act
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nodeId, autoSave, storyId, act]);

  /**
   * Timer — starts after typewriter finishes for nodes that have a `timer` field.
   */
  useEffect(() => {
    clearInterval(timerRef.current);
    setTimerLeft(null);
    setTimerTotal(null);
    tickSoundRef.current = 0;

    if (!node?.timer || !typewriterDone || transitioning || pauseOpen || showRecap) return;

    const total = node.timer;
    setTimerTotal(total);
    setTimerLeft(total);

    timerRef.current = setInterval(() => {
      setTimerLeft(prev => {
        const next = Math.max(0, prev - 0.1);
        if (next <= 3 && next > 0 && screenEffects) {
          const wholeSecond = Math.ceil(next);
          if (wholeSecond !== tickSoundRef.current) {
            tickSoundRef.current = wholeSecond;
            playTimerTick();
          }
        }
        if (next <= 0) {
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id, typewriterDone, transitioning, pauseOpen, showRecap]);

  /**
   * Timer expiry — auto-select the last available choice.
   */
  useEffect(() => {
    if (timerLeft === null || timerLeft > 0 || !node) return;

    const choices = (node.choices ?? []).filter(c => meetsRequirement(state, c.requirement));
    if (choices.length > 0) {
      playTimerExpire();
      executeChoice(choices[choices.length - 1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerLeft]);

  /**
   * Keyboard shortcuts — 1-4 for choices, Space to skip, Esc for pause.
   */
  const handleKeyDown = useCallback((e) => {
    /* Don't capture keys when typing in inputs */
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;

    /* Recap modal captures its own keys */
    if (showRecap) return;

    /* Escape toggles pause */
    if (e.code === "Escape") {
      e.preventDefault();
      setPauseOpen(prev => !prev);
      return;
    }

    /* Nothing else works while paused */
    if (pauseOpen) return;

    /* Space to skip typewriter */
    if (e.code === "Space" && !typewriterDone && !transitioning) {
      e.preventDefault();
      skipTypewriter();
      return;
    }

    /* Digit keys to select choices */
    if (typewriterDone && !transitioning) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const choice = availableChoices[num - 1];
        if (choice) {
          handleChoice(choice);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRecap, pauseOpen, typewriterDone, transitioning, availableChoices]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(transRef.current);
    };
  }, []);

  /* ---- Fallback: story not found ---- */
  if (!storyMeta || !story) {
    return (
      <div className="shell">
        <p>Story not found.</p>
        <button
          className="btn-secondary"
          onClick={() => nav("/stories")}
          style={{ width: "auto", marginTop: 16 }}
        >
          Back to Stories
        </button>
      </div>
    );
  }

  /* ---- Loading state ---- */
  if (!node) return <div className="shell">Loading story...</div>;

  /**
   * executeChoice — directly applies a choice (used after transition delay and timer expiry).
   */
  function executeChoice(choice) {
    dispatch({ type: "ADD_HISTORY", payload: { nodeId: node.id, choiceId: choice.id } });
    if (choice.effects?.length) {
      dispatch({ type: "APPLY_EFFECTS", payload: { effects: choice.effects } });
    }
    dispatch({ type: "SET_NODE", payload: { nodeId: choice.to } });
    setTransitioning(false);
  }

  /**
   * handleChoice — triggered on player click or keyboard.
   */
  function handleChoice(choice) {
    playClick();
    clearInterval(timerRef.current);
    setTimerLeft(null);
    setTransitioning(true);

    transRef.current = setTimeout(() => {
      executeChoice(choice);
    }, 300);
  }

  /** Save current game state to localStorage */
  function handleSave() {
    saveGame({
      savedAt: Date.now(),
      carry: state,
      lastEnd: null,
      story: storyId,
      act
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  /** Navigate back to home, cleaning up timers */
  function handleQuit() {
    clearInterval(timerRef.current);
    clearTimeout(transRef.current);
    nav("/");
  }

  const username = localStorage.getItem("wys2_username") || "Survivor";
  const accentColor = storyMeta.color || "#c23a3a";

  /* Build key hint index — only number available choices */
  let availableIndex = 0;

  return (
    <>
      {/* Full-screen background gradient */}
      <div className="play-bg" style={{
        background: `radial-gradient(ellipse at 30% 20%, ${accentColor}15 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${accentColor}08 0%, transparent 45%), linear-gradient(180deg, #0a0d14 0%, #0e1118 50%, #0c0f18 100%)`
      }} />

      {/* Animated particles + aurora fog */}
      <AmbientBackground storyId={storyId} accentColor={accentColor} />

      {/* Screen vignette overlay (damage / stress) */}
      {vignette && screenEffects && (
        <div className={`screen-vignette ${vignette}`} />
      )}

      {/* Pause menu overlay */}
      <PauseMenu
        isOpen={pauseOpen}
        onResume={() => setPauseOpen(false)}
        onSave={handleSave}
        onQuit={handleQuit}
        storyTitle={storyMeta.title}
        act={act}
        accentColor={accentColor}
      />

      {/* Story recap overlay (shown on save load) */}
      <RecapModal
        isOpen={showRecap}
        onClose={() => setShowRecap(false)}
        storyTitle={storyMeta.title}
        act={act}
        accentColor={accentColor}
        recentChoices={recapData}
        stats={state.stats}
        inventory={state.inventory}
        savedAt={savedAt}
      />

      <div className="play-shell">
        {/* Top navigation bar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="title">{username}</h1>
            <div className="topbar-meta">
              <span
                className="act-badge"
                style={{
                  background: `${accentColor}20`,
                  borderColor: `${accentColor}35`,
                  color: accentColor
                }}
              >
                Act {act}
              </span>
              <span className="muted">{storyMeta.title}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className={`btn-icon${showToast ? " saved" : ""}`} onClick={handleSave} aria-label="Save game">
              Save
            </button>
            <button className="btn-icon" onClick={() => setPauseOpen(true)} aria-label="Open pause menu">
              Menu
            </button>
          </div>
        </header>

        {/* Stats bar with animated deltas */}
        <div className="stats-bar">
          {["health", "stamina", "stress"].map(key => (
            <div
              key={key}
              className={`stat-pill ${key}${shaking[key] ? " shake" : ""}`}
            >
              <span className="pillLabel">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span className="pillValue">{state.stats[key]}</span>
              {statDeltas[key] && (
                <span className={`stat-delta ${statDeltas[key] > 0 ? "positive" : "negative"}`}>
                  {statDeltas[key] > 0 ? "+" : ""}{statDeltas[key]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Story card — pulses during choice transition */}
        <div ref={storyCardRef} className={`story-card${transitioning ? " pulse" : ""}`}>

          {/* Timer countdown bar */}
          {timerLeft !== null && timerTotal && (
            <div className="timer-bar-container">
              <div
                className={`timer-bar${timerLeft <= 3 ? " urgent" : ""}`}
                style={{ width: `${(timerLeft / timerTotal) * 100}%` }}
              />
            </div>
          )}

          {/* Story text with typewriter effect — click to skip */}
          <p
            className={`storyText${!transitioning && !pauseOpen && !showRecap && node.text ? " fade-in" : ""}`}
            onClick={!typewriterDone ? skipTypewriter : undefined}
            style={{ cursor: !typewriterDone ? "pointer" : "default" }}
            aria-live="polite"
          >
            {(transitioning || pauseOpen || showRecap) ? "" : displayed}
            {!typewriterDone && !transitioning && !pauseOpen && !showRecap && (
              <span className="typewriter-cursor" />
            )}
          </p>

          {/* Choices — all choices rendered, locked ones shown as disabled */}
          <div className={`choices${typewriterDone && !transitioning && !pauseOpen && !showRecap ? " entering" : ""}`} role="group" aria-label="Choices">
            {typewriterDone && !transitioning && !pauseOpen && !showRecap && allChoices.map((c) => {
              const isAvailable = meetsRequirement(state, c.requirement);
              const keyNum = isAvailable ? ++availableIndex : null;
              return (
                <ChoiceButton
                  key={c.id}
                  onClick={() => isAvailable && handleChoice(c)}
                  disabled={!isAvailable}
                  keyHint={isAvailable && keyNum <= 9 ? String(keyNum) : null}
                  requirementHint={!isAvailable ? getRequirementHint(c.requirement) : null}
                >
                  {c.label}
                </ChoiceButton>
              );
            })}
          </div>

          {/* Inventory */}
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

        {/* Save confirmation toast */}
        <div className={`save-toast${showToast ? " show" : ""}`}>
          Game saved
        </div>
      </div>
    </>
  );
}
