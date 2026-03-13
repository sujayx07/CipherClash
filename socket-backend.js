/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end('CipherClash Socket Server is Running');
});

const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Reuse the existing logic
const socketLogic = require('./src/lib/socketServer');
socketLogic.init(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[STANDALONE] Socket server listening on port ${PORT}`);
});
