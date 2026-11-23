// keeps the one shared room in memory and keeps every browser in sync

import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

// the web server, with socket.io (the live connection) attached to it
const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

// locally this is 3001; when deployed (Render), the host provides PORT
const PORT = process.env.PORT || 3001;

const THEMES = ["blue", "pink", "moss", "gothic"];
const PLANTS = ["areca", "vine", "fiddle", "multicolor"];
const LAMPS = ["tiffany", "ornate", "glass", "woven"];

// the shared room: everyone sees this same state. The first choice in each list is the start.
const room = {
  theme: THEMES[0],
  plant: PLANTS[0],
  lamp: LAMPS[0],
  queue: [], // songs waiting to play
  nowPlaying: null, // the song playing now (with a startedAt time), or null
};

// the room plus the server's current time. Browsers use serverNow to line their clocks up so everyone starts the song at the same moment.
const withServerNow = () => ({
  ...room,
  serverNow: Date.now(),
});

// send the whole room to every connected browser
const broadcastState = () => {
  io.emit("state", withServerNow());
};

// checks that a song sent by a browser has the fields we need (never trust what a browser sends)
const isSong = (song) => {
  if (!song || typeof song !== "object") return false;
  const { id, title, artist, previewUrl } = song;
  return (
    typeof id === "string" &&
    id.trim() !== "" &&
    typeof title === "string" &&
    title.trim() !== "" &&
    typeof artist === "string" &&
    artist.trim() !== "" &&
    typeof previewUrl === "string" &&
    previewUrl.startsWith("http")
  );
};

const QUEUE_LIMIT = 100;

// takes the first song off the queue and makes it the song playing now
// (or clears nowPlaying if the queue is empty).
const playNextFromQueue = () => {
  const next = room.queue.shift() || null;
  if (next) {
    room.nowPlaying = {
      ...next,
      startedAt: Date.now(), // when it began, so late joiners can jump to the right spot
      startedBy: "server",
    };
  } else {
    room.nowPlaying = null;
  }
};

// runs once for every browser that connects. `socket` is that one browser's connection.
io.on("connection", (socket) => {
  // someone just joined: send them the current room
  socket.emit("state", withServerNow());

  // change colors / plant / lamp: only accept ids that are in our lists
  socket.on("theme:set", (theme) => {
    if (!THEMES.includes(theme)) return;
    room.theme = theme;
    broadcastState();
  });

  socket.on("plant:set", (plant) => {
    if (!PLANTS.includes(plant)) return;
    room.plant = plant;
    broadcastState();
  });

  socket.on("lamp:set", (lamp) => {
    if (!LAMPS.includes(lamp)) return;
    room.lamp = lamp;
    broadcastState();
  });

  // someone picked a song from search
  socket.on("queue:add", (song) => {
    if (!isSong(song)) return; // ignore anything malformed
    if (room.queue.length >= QUEUE_LIMIT) return; // queue is full

    // copy only the fields we want (so a browser can't sneak extra data into the room)
    const normalizedSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      artwork: typeof song.artwork === "string" ? song.artwork : "",
      previewUrl: song.previewUrl,
      addedAt: Date.now(),
      addedBy: socket.id,
    };

    room.queue.push(normalizedSong);
    // if nothing is playing, start this song right away; otherwise it waits in line
    if (!room.nowPlaying) playNextFromQueue();
    broadcastState();
  });

  // someone clicked skip: move on to the next song
  socket.on("queue:skip", () => {
    playNextFromQueue();
    broadcastState();
  });

  // a browser says the song finished.
  socket.on("queue:ended", (payload) => {
    const endedId = payload?.id;
    if (typeof endedId !== "string" || endedId.trim() === "") return;
    if (!room.nowPlaying) return;
    if (room.nowPlaying.id !== endedId) return;

    playNextFromQueue();
    broadcastState();
  });

  socket.on("disconnect", () => {});
});

// start listening for connections
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});