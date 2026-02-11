import { useNavigate } from "react-router-dom";
import stories from "../data/stories";

const storyList = Object.values(stories);

export default function StorySelect() {
  const nav = useNavigate();
  const username = localStorage.getItem("wys2_username") || "Survivor";

  function handleSelect(storyId) {
    nav(`/play?story=${storyId}&act=1`);
  }

  return (
    <>
      <div className="select-bg" />
      <div className="shell">
        <div className="select-container">
          <div className="select-header">
            <button className="btn-icon" onClick={() => nav("/")}>Back</button>
            <div>
              <h1 className="select-title">Choose Your Story</h1>
              <p className="muted">Playing as <strong>{username}</strong></p>
            </div>
          </div>

          <div className="story-grid">
            {storyList.map((s) => (
              <button
                key={s.id}
                className="story-select-card"
                onClick={() => handleSelect(s.id)}
                style={{ "--story-color": s.color }}
              >
                <div className="story-select-accent" />
                <div className="story-select-content">
                  <span className="story-select-badge">{s.subtitle}</span>
                  <h2 className="story-select-title">{s.title}</h2>
                  <p className="story-select-desc">{s.description}</p>
                  <div className="story-select-meta">
                    <span>{s.actCount} Acts</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
