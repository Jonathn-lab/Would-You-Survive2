/**
 * stories.js
 * Central registry of all available stories in the game.
 *
 * Each story entry contains:
 *   - id:          Unique string identifier used in URLs and save data.
 *   - title:       Display name of the story.
 *   - subtitle:    Genre or short descriptor shown as a badge.
 *   - description: Longer text shown on the story selection card.
 *   - color:       Hex color used for themed accent styling throughout the UI.
 *   - acts:        Object mapping act numbers (as strings) to imported JSON act data.
 *   - actCount:    Number of acts available (used for display on story cards).
 *
 * Act data is imported from JSON files organized under data/<storyId>/act<N>.json.
 * Each act JSON contains a `meta` object and a `nodes` array defining the story tree.
 */

/* Import act data JSON files for each story */
import zombieAct1 from "./zombie/act1.json";
import zombieAct2 from "./zombie/act2.json";
import eldenringAct1 from "./eldenring/act1.json";
import eldenringAct2 from "./eldenring/act2.json";
import spaceAct1 from "./space/act1.json";
import spaceAct2 from "./space/act2.json";

/**
 * stories - The master story registry keyed by story ID.
 * Add new stories here to make them available in the story selection screen.
 */
const stories = {
  /* Zombie Night - suburban zombie survival scenario */
  zombie: {
    id: "zombie",
    title: "Zombie Night",
    subtitle: "Suburban Survival",
    description: "2 AM. Emergency alert. Something is at your door. Survive the night in a suburban neighborhood overrun by the infected.",
    color: "#c23a3a",
    acts: { "1": zombieAct1, "2": zombieAct2 },
    actCount: 2,
  },
  /* Elden Ring - dark fantasy adventure inspired by the game */
  eldenring: {
    id: "eldenring",
    title: "Elden Ring",
    subtitle: "Dark Fantasy",
    description: "You awaken as a Tarnished with no memory. The Lands Between are hostile and strange. Seek the Elden Ring — or die forgotten.",
    color: "#d4a83a",
    acts: { "1": eldenringAct1, "2": eldenringAct2 },
    actCount: 2,
  },
  /* Void Protocol - deep space horror scenario */
  space: {
    id: "space",
    title: "Void Protocol",
    subtitle: "Deep Space Horror",
    description: "Alarms blare on station Artemis-7. Something hit the hull. Systems are failing, crew is scattered, and you're running out of oxygen.",
    color: "#3a8ec2",
    acts: { "1": spaceAct1, "2": spaceAct2 },
    actCount: 2,
  },
};

export default stories;
