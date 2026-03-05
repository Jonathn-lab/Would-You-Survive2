/**
 * useTypewriter.js
 * Custom hook that reveals text character-by-character at a configurable speed.
 * Uses requestAnimationFrame for smooth, jank-free animation.
 *
 * Speed settings map to milliseconds per character:
 *   slow=35ms, normal=18ms, fast=8ms, instant=0ms (no animation)
 *
 * Returns:
 *   - displayed: the currently visible portion of the text
 *   - done: boolean, true when the full text is revealed
 *   - skip: function to instantly reveal all text
 */

import { useState, useEffect, useRef } from "react";

const SPEEDS = { slow: 35, normal: 18, fast: 8, instant: 0 };

export function useTypewriter(text, speed = "normal") {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    const target = text || "";
    const ms = SPEEDS[speed] ?? SPEEDS.normal;

    startRef.current = performance.now();

    function tick(now) {
      if (!target || ms === 0) {
        setDisplayed(target);
        setDone(true);
        return;
      }
      const elapsed = now - startRef.current;
      const chars = Math.min(Math.floor(elapsed / ms) + 1, target.length);
      setDisplayed(target.slice(0, chars));
      if (chars >= target.length) {
        setDone(true);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, speed]);

  function skip() {
    cancelAnimationFrame(rafRef.current);
    setDisplayed(textRef.current || "");
    setDone(true);
  }

  return { displayed, done, skip };
}
