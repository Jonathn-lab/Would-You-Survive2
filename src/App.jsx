/**
 * App.jsx
 * Root application component that defines all client-side routes.
 * Uses React Router's <Routes> and <Route> to map URL paths to page components.
 * A catch-all "*" route renders the NotFound (404) page for unrecognized paths.
 */

import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import StorySelect from "./pages/storyselect.jsx";
import Game from "./pages/game.jsx";
import GameOver from "./pages/gameover.jsx";
import Settings from "./pages/settings.jsx";
import NotFound from "./pages/notfound.jsx";

/**
 * App - The top-level component that renders the appropriate page
 * based on the current URL path via React Router.
 *
 * Route map:
 *   /           -> Home (landing page with username input)
 *   /stories    -> StorySelect (choose a story to play)
 *   /play       -> Game (active gameplay screen)
 *   /game-over  -> GameOver (end-of-run summary)
 *   /settings   -> Settings (user preferences and data management)
 *   *           -> NotFound (404 fallback for invalid URLs)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stories" element={<StorySelect />} />
      <Route path="/play" element={<Game />} />
      <Route path="/game-over" element={<GameOver />} />
      <Route path="/settings" element={<Settings />} />
      {/* Catch-all route for any unmatched path - shows 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
