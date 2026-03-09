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
import PageTransition from "./components/PageTransition.jsx";

export default function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<StorySelect />} />
        <Route path="/play" element={<Game />} />
        <Route path="/game-over" element={<GameOver />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}
