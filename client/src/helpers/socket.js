// opens a live connection to the server and shares it with the whole app.
import { io } from "socket.io-client";

// running on computer: port 3001
// deployed: VITE_SERVER_URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const socket = io(SERVER_URL); // connects automatically, and reconnects if it drops
