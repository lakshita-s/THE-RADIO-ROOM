// holds everything about the room's state and gives App.jsx simple ways to change it.
// SHARED state (theme, plant, lamp, queue, now playing)- sends a request to server (emit), it updates and tells every 
// browser the new state, and whatever it sends is shown.
// LOCAL state (posters- only in local browser for now.
import { useEffect, useRef, useState } from "react";
import { socket } from "./socket.js";
import { LAMPS, PLANTS, POSTER_SLOTS, THEMES } from "../config.js";

const MAX_POSTER_BYTES = 5 * 1024 * 1024; // 5 MB per poster
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// what the room looks like before the server answers (the first choice of each list).
const START = {
  theme: THEMES[0],
  plant: PLANTS[0].id,
  lamp: LAMPS[0].id,
  queue: [],
  nowPlaying: null,
};

export function useRoom() {
  const [shared, setShared] = useState(START); // comes from the server
  const [connected, setConnected] = useState(socket.connected);
  const [posters, setPosters] = useState(Array(POSTER_SLOTS).fill(null)); // local only

  const offsetRef = useRef(0);

  // listen to the server. (the returned function stops listening when the app closes.)
  useEffect(() => {
    const onState = (state) => {
      offsetRef.current = state.serverNow - Date.now();
      setShared(state);
    };
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("state", onState);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("state", onState);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // ask the server to change something, e.g. emit("theme:set", "pink").
  const emit = (event, payload) => {
    if (socket.connected) socket.emit(event, payload);
  };

  // ----- posters (local) -----
  // put image files into the wall, filling the next empty frames in order.
  // returns an error message, or "".
  const addPosters = (files) => {
    const next = [...posters];
    let error = "";

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        error = "Only PNG, JPG, WEBP or GIF images";
        break;
      }
      if (file.size > MAX_POSTER_BYTES) {
        error = "Image must be under 5 MB";
        break;
      }
      const i = next.findIndex((p) => !p);
      if (i === -1) {
        error = "All poster slots are full. Remove one to add another.";
        break;
      }
      next[i] = URL.createObjectURL(file); // a temporary link to the file on this computer
    }

    setPosters(next);
    return error;
  };

  const clearPoster = (slot) => {
    URL.revokeObjectURL(posters[slot]);
    setPosters(posters.map((p, i) => (i === slot ? null : p)));
  };

  return {
    room: { ...shared, posters }, // everything App needs to draw the room
    connected,
    offsetRef,
    emit,
    addPosters,
    clearPoster,
  };
}
