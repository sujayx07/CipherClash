/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Attach all socket logic
  require('./src/lib/socketServer').init(io);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> CipherClash ready on http://localhost:${PORT}`);
  });
});
