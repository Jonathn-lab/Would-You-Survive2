const SAVE_KEY = "wys2_save_zombie";

export function saveZombieRun(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadZombieRun() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearZombieRun() {
  localStorage.removeItem(SAVE_KEY);
}
