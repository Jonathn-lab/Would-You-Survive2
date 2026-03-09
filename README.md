# Would You Survive (WYS 2.0)

A choice-driven survival game built with React. Three stories, branching paths, and every decision shapes your fate.

## Stories

- **Zombie Night** -- Survive the first night of an outbreak in a suburban neighborhood.
- **Elden Ring** -- Navigate the Lands Between as a freshly risen Tarnished.
- **Void Protocol** -- Respond to a distress signal aboard a derelict space station.

Each story has 2 acts with branching node trees, multiple endings, and stat-driven mechanics (health, stamina, stress).

## Features

- Typewriter text with adjustable speed
- Timed choices that auto-resolve
- Stat tracking with animated feedback
- Inventory and requirement system
- Synthesized sound effects (zero external assets)
- Canvas particle backgrounds per story
- Auto-save and manual save/load
- Keyboard shortcuts (1-4 for choices, Space to skip, Esc to pause)
- Full dark theme

## Run Locally

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build    # Production build to dist/
npm run deploy   # Build + deploy to GitHub Pages
```

## Tech

React 19 + Vite 7 + React Router 6. No backend, no external assets, no dependencies beyond React.
