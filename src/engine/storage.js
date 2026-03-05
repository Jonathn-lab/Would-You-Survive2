/**
 * storage.js
 * Handles saving and loading game data to/from the browser's localStorage.
 *
 * All game save data is stored under a single key ("wys2_save_zombie").
 * The save data includes:
 *   - savedAt:  Timestamp (ms) of when the save was created.
 *   - carry:    The full game state (stats, inventory, flags, history).
 *   - lastEnd:  The ending data if the player completed an act (or null).
 *   - story:    The story ID (e.g. "zombie").
 *   - act:      The act number as a string (e.g. "1").
 */

/** localStorage key where the game save is stored */
const SAVE_KEY = "wys2_save_zombie";

/**
 * saveZombieRun - Serialize and save game data to localStorage.
 * Overwrites any existing save under the same key.
 * @param {object} data - The save data object to persist.
 */
export function saveZombieRun(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/**
 * loadZombieRun - Read and parse the saved game data from localStorage.
 * @returns {object|null} The parsed save data, or null if no save exists
 *                        or if the stored JSON is corrupted.
 */
export function loadZombieRun() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    /* If JSON parsing fails (corrupted data), return null gracefully */
    return null;
  }
}

/**
 * clearZombieRun - Remove the saved game data from localStorage.
 * Called from the settings page when the player clears all data.
 */
export function clearZombieRun() {
  localStorage.removeItem(SAVE_KEY);
}
