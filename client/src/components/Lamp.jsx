// shows the selected lamp
import { LAMPS } from "../config.js";

export default function Lamp({ lamp }) {
  // find the lamp with that id (or use the first one if it isn't found).
  const current = LAMPS.find((l) => l.id === lamp) || LAMPS[0];
  return (
    <div className="lamp">
      <img
        src={current.src}
        alt={current.label}
      />
    </div>
  );
}
