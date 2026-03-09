/**
 * storyEngine.js
 * Core utility functions for navigating and querying story data.
 *
 * Story data structure (per act):
 *   {
 *     meta: { id, startNodeId, ... },
 *     nodes: [
 *       {
 *         id: "node_1",
 *         text: "Story text...",
 *         choices: [
 *           { id: "c1", label: "Do X", to: "node_2", effects: [...], requirement: {...} }
 *         ],
 *         onEnter: [...],   // Effects applied when entering this node
 *         end: { ... }      // Present if this node ends the story/act
 *       },
 *       ...
 *     ]
 *   }
 */

/**
 * getNode - Look up a story node by its unique ID.
 * @param {object} story  - The story act data containing a `nodes` array.
 * @param {string} nodeId - The ID of the node to find.
 * @returns {object|null} The matching node object, or null if not found.
 */
export function getNode(story, nodeId) {
  return story.nodes.find((n) => n.id === nodeId) || null;
}

/**
 * meetsRequirement - Check whether the current game state satisfies a
 * choice's requirement. Used to filter which choices are available to the player.
 *
 * Supported requirement types:
 *   - { type: "hasItem", item: "Flashlight" }        -> Player must have the item.
 *   - { type: "minStat", key: "health", value: 3 }   -> Stat must be >= value.
 *   - { type: "flagEquals", key: "met", value: true } -> Flag must equal value.
 *
 * @param {object}      state - The current game state (inventory, stats, flags).
 * @param {object|null} req   - The requirement object, or null/undefined if none.
 * @returns {boolean} True if the requirement is met (or if there is no requirement).
 */
export function meetsRequirement(state, req) {
  /* No requirement means the choice is always available */
  if (!req) return true;

  if (req.type === "hasItem") return state.inventory.includes(req.item);
  if (req.type === "minStat") return (state.stats[req.key] ?? 0) >= req.value;
  if (req.type === "flagEquals") return (state.flags[req.key] ?? false) === req.value;

  /*
   * Unknown requirement types default to false (blocks the choice).
   * This is a safety measure to prevent showing choices with unrecognized
   * requirements that the engine cannot properly validate.
   */
  return false;
}

/**
 * getRequirementHint - Generate a human-readable hint for a locked choice.
 * Used to show players why a choice is unavailable.
 *
 * Flag-based requirements return null (too spoilery to expose).
 *
 * @param {object|null} req - The requirement object.
 * @returns {string|null} A hint string, or null if no hint should be shown.
 */
export function getRequirementHint(req) {
  if (!req) return null;
  if (req.type === "hasItem") return `Requires: ${req.item}`;
  if (req.type === "minStat") {
    const label = req.key.charAt(0).toUpperCase() + req.key.slice(1);
    return `Requires: ${label} \u2265 ${req.value}`;
  }
  return null;
}
