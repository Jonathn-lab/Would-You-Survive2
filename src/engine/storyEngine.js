export function getNode(story, nodeId) {
  return story.nodes.find((n) => n.id === nodeId) || null;
}

export function meetsRequirement(state, req) {
  if (!req) return true;

  if (req.type === "hasItem") return state.inventory.includes(req.item);
  if (req.type === "minStat") return (state.stats[req.key] ?? 0) >= req.value;
  if (req.type === "flagEquals") return state.flags[req.key] === req.value;

  return false;
}
