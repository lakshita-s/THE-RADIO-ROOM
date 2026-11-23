// gets the room's state from useRoom (shared with everyone through the server)
// decides what each button does
import { useRef, useState } from "react";
import { LAMPS, PLANTS, THEMES } from "./config.js";
import { useRoom } from "./helpers/useRoom.js";
import { useRadioAudio } from "./helpers/useRadioAudio.js";
import Remote from "./components/Remote.jsx";
import PosterWall from "./components/PosterWall.jsx";
import Plant from "./components/Plant.jsx";
import Lamp from "./components/Lamp.jsx";
import Radio from "./components/Radio.jsx";
import QueuePanel from "./components/QueuePanel.jsx";

// the ids that are cycled through with the remote.
const PLANT_IDS = PLANTS.map((p) => p.id);
const LAMP_IDS = LAMPS.map((l) => l.id);

// the item after `current` in the list, wrapping back to the first at the end.
const nextOf = (ids, current) => ids[(ids.indexOf(current) + 1) % ids.length];

export default function App() {
  const { room, connected, offsetRef, emit, addPosters, clearPoster } =
    useRoom();

  const [tunedIn, setTunedIn] = useState(false); // true once you've clicked the radio

  const fileRef = useRef(null); // the hidden file picker (for posters)

  // plays the song that's on in the moment
  useRadioAudio(room.nowPlaying, offsetRef, tunedIn);

  // posters (stay on local computer for now)
  const openFilePicker = () => fileRef.current.click();

  const onFilesChosen = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (files.length === 0) return;

    const error = addPosters(files);
    if (error) alert(error);
  };

  return (
    <div className="stage">
      {/* the canvas: data-theme switches the colors */}
      <div className="canvas" data-theme={room.theme}>
        <div className="wall" />
        <div className="slab">
          <img src="/assets/display-slab.png" alt="display slab" />
        </div>

        <h1 className="title">THE RADIO ROOM</h1>

        {/* each button asks the server for the next item in its list */}
        <Remote
          onColors={() => emit("theme:set", nextOf(THEMES, room.theme))}
          onPlant={() => emit("plant:set", nextOf(PLANT_IDS, room.plant))}
          onLamp={() => emit("lamp:set", nextOf(LAMP_IDS, room.lamp))}
          onPosters={openFilePicker}
        />

        <PosterWall posters={room.posters} onClear={clearPoster} />

        <Plant plant={room.plant} />
        <Lamp lamp={room.lamp} />

        <div className="slab two">
          <img src="/assets/display-slab.png" alt="display slab" />
        </div>

        <Radio
          tunedIn={tunedIn}
          onToggle={() => {
            setTunedIn(!tunedIn);
          }}
        />

        <QueuePanel
          nowPlaying={room.nowPlaying}
          queue={room.queue}
          onSkip={() => emit("queue:skip")}
          onAdd={(song) => emit("queue:add", song)}
        />

        {!connected && <div className="offline">Connecting to server…</div>}
      </div>

      {/* the invisible file picker that the poster buttons open. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={onFilesChosen}
      />
    </div>
  );
}
