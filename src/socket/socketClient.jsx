import { io } from "socket.io-client";

export const socket = io("http://10.0.0.138:3000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("✅ Connected to backend:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
