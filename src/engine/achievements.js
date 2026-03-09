/**
 * achievements.js
 * Achievement definitions and checking engine for WYS 2.0.
 *
 * Each achievement has:
 *   - id:          Unique string identifier.
 *   - title:       Display name shown in the trophy case.
 *   - description: Short description of how to unlock it.
 *   - rarity:      "common" | "rare" | "legendary" — affects visual styling.
 *   - icon:        Single emoji/character used as the trophy icon.
 *   - check:       Function(context) => boolean — evaluates whether the achievement is earned.
 *
 * The check function receives a context object:
 *   { end, final, storyId, act, achStats }
 *   - end:       The ending object ({ type, title, reason }).
 *   - final:     The final game state (stats, inventory, flags, history).
 *   - storyId:   Which story was played.
 *   - act:       Which act was completed.
 *   - achStats:  Cumulative stats across all runs (deaths, completions, etc.).
 */

import {
  loadAchievements,
  saveAchievements,
  loadAchievementStats,
  saveAchievementStats,
} from "./storage";

/** All 18 achievement definitions */
export const ACHIEVEMENTS = [
  // --- Progression ---
  {
    id: "first_steps",
    title: "First Steps",
    description: "Complete any act",
    rarity: "common",
    icon: "\u{1F463}",
    check: (ctx) => ctx.end?.type === "act_complete",
  },
  {
    id: "first_blood",
    title: "First Blood",
    description: "Die for the first time",
    rarity: "common",
    icon: "\u{1F480}",
    check: (ctx) => ctx.end?.type === "dead",
  },
  {
    id: "serial_victim",
    title: "Serial Victim",
    description: "Die 5 times total",
    rarity: "rare",
    icon: "\u{26B0}\uFE0F",
    check: (ctx) => (ctx.achStats.deaths ?? 0) >= 5,
  },

  // --- Story-specific completions ---
  {
    id: "zombie_act1",
    title: "Night Survivor",
    description: "Complete Zombie Night Act 1",
    rarity: "common",
    icon: "\u{1F9DF}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "zombie" &&
      ctx.act === "1",
  },
  {
    id: "zombie_act2",
    title: "Dawn Breaker",
    description: "Complete Zombie Night Act 2",
    rarity: "rare",
    icon: "\u{1F305}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "zombie" &&
      ctx.act === "2",
  },
  {
    id: "elden_act1",
    title: "Tarnished Rising",
    description: "Complete Elden Ring Act 1",
    rarity: "common",
    icon: "\u{2694}\uFE0F",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "eldenring" &&
      ctx.act === "1",
  },
  {
    id: "elden_act2",
    title: "Rune Bearer",
    description: "Complete Elden Ring Act 2",
    rarity: "rare",
    icon: "\u{1F451}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "eldenring" &&
      ctx.act === "2",
  },
  {
    id: "space_act1",
    title: "Escape Velocity",
    description: "Complete Void Protocol Act 1",
    rarity: "common",
    icon: "\u{1F680}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "space" &&
      ctx.act === "1",
  },
  {
    id: "space_act2",
    title: "Signal Received",
    description: "Complete Void Protocol Act 2",
    rarity: "rare",
    icon: "\u{1F4E1}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      ctx.storyId === "space" &&
      ctx.act === "2",
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Complete all 6 acts",
    rarity: "legendary",
    icon: "\u{1F3C6}",
    check: (ctx) => {
      const completed = ctx.achStats.actsCompleted ?? [];
      const required = [
        "zombie_1", "zombie_2",
        "eldenring_1", "eldenring_2",
        "space_1", "space_2",
      ];
      return required.every((key) => completed.includes(key));
    },
  },

  // --- Stat-based ---
  {
    id: "full_health",
    title: "Untouchable",
    description: "Finish an act with full health",
    rarity: "rare",
    icon: "\u{1F49A}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      (ctx.final?.stats?.health ?? 0) >= 5,
  },
  {
    id: "max_stress",
    title: "Nerves of Steel",
    description: "Finish an act with stress \u2265 8",
    rarity: "rare",
    icon: "\u{1F9CA}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      (ctx.final?.stats?.stress ?? 0) >= 8,
  },
  {
    id: "by_a_thread",
    title: "By a Thread",
    description: "Finish an act with exactly 1 HP",
    rarity: "legendary",
    icon: "\u{1FA78}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      (ctx.final?.stats?.health ?? 0) === 1,
  },
  {
    id: "hoarder",
    title: "Hoarder",
    description: "Finish with 4+ items in inventory",
    rarity: "rare",
    icon: "\u{1F392}",
    check: (ctx) =>
      ctx.end?.type === "act_complete" &&
      (ctx.final?.inventory?.length ?? 0) >= 4,
  },

  // --- Special ---
  {
    id: "infected",
    title: "Patient Zero",
    description: "Get the infected ending",
    rarity: "common",
    icon: "\u{1F9A0}",
    check: (ctx) => ctx.end?.type === "infected",
  },
  {
    id: "quick_draw",
    title: "Quick Draw",
    description: "Choose within 2s of a timer starting",
    rarity: "rare",
    icon: "\u{26A1}",
    check: (ctx) => ctx.final?.flags?.quickDraw === true,
  },
  {
    id: "explorer",
    title: "Pathfinder",
    description: "Visit 15+ nodes in one run",
    rarity: "rare",
    icon: "\u{1F9ED}",
    check: (ctx) => (ctx.final?.history?.length ?? 0) >= 15,
  },
  {
    id: "die_hard",
    title: "Die Hard",
    description: "Die in all 3 stories",
    rarity: "legendary",
    icon: "\u{1F525}",
    check: (ctx) => {
      const stories = ctx.achStats.deathStories ?? [];
      return (
        stories.includes("zombie") &&
        stories.includes("eldenring") &&
        stories.includes("space")
      );
    },
  },
];

/**
 * checkAchievements - Evaluate all achievements against the current run context.
 * Updates cumulative stats, persists newly unlocked achievements, and returns
 * the list of newly unlocked achievement objects.
 *
 * @param {{ end, final, storyId, act }} runData - Data from the completed run.
 * @returns {object[]} Array of newly unlocked achievement definition objects.
 */
export function checkAchievements({ end, final, storyId, act }) {
  // Load persisted data
  const unlocked = new Set(loadAchievements());
  const achStats = loadAchievementStats();

  // Update cumulative stats before checking
  if (end?.type === "dead") {
    achStats.deaths = (achStats.deaths ?? 0) + 1;
    const deathStories = new Set(achStats.deathStories ?? []);
    deathStories.add(storyId);
    achStats.deathStories = [...deathStories];
  }

  if (end?.type === "act_complete") {
    const actsCompleted = new Set(achStats.actsCompleted ?? []);
    actsCompleted.add(`${storyId}_${act}`);
    achStats.actsCompleted = [...actsCompleted];
  }

  // Save updated stats
  saveAchievementStats(achStats);

  // Build context for checks
  const ctx = { end, final, storyId, act, achStats };

  // Evaluate each achievement
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlocked.has(ach.id)) continue;
    try {
      if (ach.check(ctx)) {
        unlocked.add(ach.id);
        newlyUnlocked.push(ach);
      }
    } catch {
      // Skip achievements that error during check
    }
  }

  // Persist unlocked set
  if (newlyUnlocked.length > 0) {
    saveAchievements([...unlocked]);
  }

  return newlyUnlocked;
}
