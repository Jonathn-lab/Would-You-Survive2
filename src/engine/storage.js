/**
 * storage.js
 * Handles saving and loading game data to/from the browser's localStorage.
 *
 * All game save data is stored under a single key ("wys2_save").
 * The save data includes:
 *   - savedAt:  Timestamp (ms) of when the save was created.
 *   - carry:    The full game state (stats, inventory, flags, history).
 *   - lastEnd:  The ending data if the player completed an act (or null).
 *   - story:    The story ID (e.g. "zombie").
 *   - act:      The act number as a string (e.g. "1").
 */

/** localStorage key where the game save is stored */
const SAVE_KEY = "wys2_save";

/**
 * saveGame - Serialize and save game data to localStorage.
 * Overwrites any existing save under the same key.
 * @param {object} data - The save data object to persist.
 */
export function saveGame(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/**
 * loadGame - Read and parse the saved game data from localStorage.
 * Also checks the legacy key for backward compatibility.
 * @returns {object|null} The parsed save data, or null if no save exists
 *                        or if the stored JSON is corrupted.
 */
export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem("wys2_save_zombie");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * clearGame - Remove the saved game data from localStorage.
 * Called from the settings page when the player clears all data.
 */
export function clearGame() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem("wys2_save_zombie");
}
