import { io } from "socket.io-client";

const socket = io("https://marketplacepriceupdater.onrender.com", {
  transports: ["websocket"],
});

export default socket;
