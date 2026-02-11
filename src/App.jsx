import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import StorySelect from "./pages/storyselect.jsx";
import Game from "./pages/game.jsx";
import GameOver from "./pages/gameover.jsx";
import Settings from "./pages/settings.jsx";
import NotFound from "./pages/notfound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stories" element={<StorySelect />} />
      <Route path="/play" element={<Game />} />
      <Route path="/game-over" element={<GameOver />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
