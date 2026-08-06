import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { setSocketServer } from "./lib/socket.js";

const PORT = Number(process.env.PORT) || 3001;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://marketplace-price-updater-delta.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Make Socket.IO available everywhere
setSocketServer(io);

io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
