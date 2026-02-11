// src/engine/gameReducer.js

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

  // tracks nodes that already ran onEnter
  visitedNodes: {}
};

export function gameReducer(state, action) {
  switch (action.type) {
    case "START_GAME": {
      const carry = action.payload?.carry;

      return {
        ...initialState,

        // carry over state from previous act if provided
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
        visitedNodes: {}
      };
    }

    case "SET_NODE":
      return {
        ...state,
        nodeId: action.payload.nodeId
      };

    case "APPLY_EFFECTS":
      return applyEffects(state, action.payload.effects);

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

    case "MARK_VISITED":
      return {
        ...state,
        visitedNodes: {
          ...state.visitedNodes,
          [action.payload.nodeId]: true
        }
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

/* =========================
   Helpers
========================= */

function applyEffects(state, effects = []) {
  let next = { ...state };

  for (const effect of effects) {
    switch (effect.type) {
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

      case "addItem": {
        if (!next.inventory.includes(effect.item)) {
          next = {
            ...next,
            inventory: [...next.inventory, effect.item]
          };
        }
        break;
      }

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

      default:
        break;
    }
  }

  return next;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
