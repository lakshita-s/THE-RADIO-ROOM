// opens a live connection to the server and shares it with the whole app.
import { io } from "socket.io-client";

// running on computer: port 3001
// deployed: VITE_SERVER_URL
export const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3001");