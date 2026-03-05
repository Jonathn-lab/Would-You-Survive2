/**
 * gameReducer.js
 * A React useReducer-compatible reducer that manages the entire game state.
 *
 * State shape:
 *   - storyId:      Current story identifier (e.g. "zombie").
 *   - nodeId:       Current story node the player is on.
 *   - stats:        Player stats object { health, stamina, stress, luck }.
 *   - inventory:    Array of item name strings the player has collected.
 *   - flags:        Key-value object for story flags (e.g. { "metNPC": true }).
 *   - history:      Array of { nodeId, choiceId, at } tracking player decisions.
 *   - visitedNodes: Object tracking which nodes have already run their onEnter effects.
 *
 * Action types:
 *   - START_GAME:    Initialize a new game or act (optionally carrying over state).
 *   - SET_NODE:      Move the player to a different story node.
 *   - APPLY_EFFECTS: Apply an array of effect objects to modify stats/inventory/flags.
 *   - ADD_HISTORY:   Record a player's choice in the history log.
 *   - MARK_VISITED:  Mark a node as visited so its onEnter effects don't repeat.
 *   - RESET:         Reset all state back to initialState.
 */

/** Default starting state for a new game */
export const initialState = {
  storyId: null,
  nodeId: null,

  stats: {
    health: 5,
    stamina: 5,
    stress: 0,
    luck: 0
  },

  inventory: [],
  flags: {},
  history: [],

  /** Tracks which nodes have already executed their onEnter effects */
  visitedNodes: {}
};

/**
 * gameReducer - The main reducer function for game state transitions.
 * @param {object} state  - The current game state.
 * @param {object} action - The dispatched action { type, payload }.
 * @returns {object} The new game state.
 */
export function gameReducer(state, action) {
  switch (action.type) {

    /**
     * START_GAME - Begin a new game or act.
     * If payload.carry is provided (from a completed act), stats, inventory,
     * flags, and history are carried forward. visitedNodes is always reset.
     */
    case "START_GAME": {
      const carry = action.payload?.carry;

      return {
        ...initialState,

        /* Carry over persistent state from a previous act if provided */
        ...(carry
          ? {
              stats: carry.stats ?? initialState.stats,
              inventory: carry.inventory ?? [],
              flags: carry.flags ?? {},
              history: carry.history ?? []
            }
          : {}),

        storyId: action.payload.storyId,
        nodeId: action.payload.startNodeId,
        /* Always reset visitedNodes for a new act */
        visitedNodes: {}
      };
    }

    /** SET_NODE - Update the current story node ID */
    case "SET_NODE":
      return {
        ...state,
        nodeId: action.payload.nodeId
      };

    /** APPLY_EFFECTS - Process an array of effect objects (stat changes, items, flags) */
    case "APPLY_EFFECTS":
      return applyEffects(state, action.payload.effects);

    /** ADD_HISTORY - Append a choice record to the player's history log */
    case "ADD_HISTORY":
      return {
        ...state,
        history: [
          ...state.history,
          {
            nodeId: action.payload.nodeId,
            choiceId: action.payload.choiceId,
            at: Date.now()
          }
        ]
      };

    /** MARK_VISITED - Record that a node's onEnter effects have already been applied */
    case "MARK_VISITED":
      return {
        ...state,
        visitedNodes: {
          ...state.visitedNodes,
          [action.payload.nodeId]: true
        }
      };

    /** RESET - Restore the game to its initial default state */
    case "RESET":
      return initialState;

    /** Unknown action types are ignored - return state unchanged */
    default:
      return state;
  }
}

/* =========================
   Helper Functions
========================= */

/**
 * applyEffects - Iterate over an array of effect objects and apply each one
 * to produce a new state. Effects are processed in order.
 *
 * Supported effect types:
 *   - { type: "stat", key: "health", delta: -2 }    -> Adjust a stat by delta.
 *   - { type: "addItem", item: "Flashlight" }        -> Add an item to inventory.
 *   - { type: "setFlag", key: "metNPC", value: true } -> Set a story flag.
 *
 * @param {object} state   - The current game state.
 * @param {Array}  effects - Array of effect objects to apply.
 * @returns {object} The updated game state after all effects are applied.
 */
function applyEffects(state, effects = []) {
  let next = { ...state };

  for (const effect of effects) {
    switch (effect.type) {

      /* Modify a numeric stat by a delta value, clamped to [-999, 999] */
      case "stat": {
        next = {
          ...next,
          stats: {
            ...next.stats,
            [effect.key]: clamp(
              (next.stats[effect.key] ?? 0) + effect.delta,
              -999,
              999
            )
          }
        };
        break;
      }

      /* Add an item to inventory if not already present (prevents duplicates) */
      case "addItem": {
        if (!next.inventory.includes(effect.item)) {
          next = {
            ...next,
            inventory: [...next.inventory, effect.item]
          };
        }
        break;
      }

      /* Set a story flag to a specific value */
      case "setFlag": {
        next = {
          ...next,
          flags: {
            ...next.flags,
            [effect.key]: effect.value
          }
        };
        break;
      }

      /* Unrecognized effect types are silently skipped */
      default:
        break;
    }
  }

  return next;
}

/**
 * clamp - Constrain a numeric value within a min/max range.
 * @param {number} value - The value to clamp.
 * @param {number} min   - The minimum allowed value.
 * @param {number} max   - The maximum allowed value.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
