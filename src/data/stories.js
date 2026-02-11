import zombieAct1 from "./zombie/act1.json";
import zombieAct2 from "./zombie/act2.json";
import eldenringAct1 from "./eldenring/act1.json";
import eldenringAct2 from "./eldenring/act2.json";
import spaceAct1 from "./space/act1.json";
import spaceAct2 from "./space/act2.json";

const stories = {
  zombie: {
    id: "zombie",
    title: "Zombie Night",
    subtitle: "Suburban Survival",
    description: "2 AM. Emergency alert. Something is at your door. Survive the night in a suburban neighborhood overrun by the infected.",
    color: "#c23a3a",
    acts: { "1": zombieAct1, "2": zombieAct2 },
    actCount: 2,
  },
  eldenring: {
    id: "eldenring",
    title: "Elden Ring",
    subtitle: "Dark Fantasy",
    description: "You awaken as a Tarnished with no memory. The Lands Between are hostile and strange. Seek the Elden Ring — or die forgotten.",
    color: "#d4a83a",
    acts: { "1": eldenringAct1, "2": eldenringAct2 },
    actCount: 2,
  },
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
