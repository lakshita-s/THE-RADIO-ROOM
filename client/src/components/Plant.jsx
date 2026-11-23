// shows the selected plant
import { PLANTS } from "../config.js";

export default function Plant({ plant }) {
  // find the plant with that id (or use the first one if it isn't found).
  const current = PLANTS.find((p) => p.id === plant) || PLANTS[0];
  return (
    <div className="plant">
      <img src={current.src} alt={current.label}/>
    </div>
  );
}
