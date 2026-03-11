const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

function generateRoomCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
}

function isValidSecret(secret) {
  if (secret.length !== 4) return false;
  if (!/^\d+$/.test(secret)) return false;
  const unique = new Set(secret);
  return unique.size === 4;
}

function getFeedback(guess, secret) {
  let exact = 0;
  let numbers = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else if (secret.includes(guess[i])) {
      numbers++;
    }
  }
  return { exact, numbers };
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', () => {
    const code = generateRoomCode();
    rooms[code] = {
      players: [{ id: socket.id, secret: null }],
      currentTurn: null,
      history: [],
      status: 'waiting'
    };
    socket.join(code);
    socket.emit('room_created', code);
    console.log(`Room ${code} created by ${socket.id}`);
  });

  socket.on('join_room', (code) => {
    const room = rooms[code];
    if (room) {
      if (room.players.length < 2) {
        room.players.push({ id: socket.id, secret: null });
        socket.join(code);
        io.to(code).emit('player_joined', room.players.map(p => p.id));
        socket.emit('room_joined', code);
        console.log(`${socket.id} joined room ${code}`);
      } else {
        socket.emit('error', 'Room is full');
      }
    } else {
      socket.emit('error', 'Invalid room code');
    }
  });

  socket.on('set_secret', ({ roomCode, secret }) => {
    const room = rooms[roomCode];
    if (!room || !isValidSecret(secret)) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.secret = secret;
    socket.emit('secret_locked');

    const bothLocked = room.players.length === 2 && room.players.every(p => p.secret !== null);
    if (bothLocked) {
      room.status = 'playing';
      room.currentTurn = room.players[0].id;
      io.to(roomCode).emit('game_start', {
        turn: room.currentTurn,
        players: room.players.map(p => p.id)
      });
      console.log(`Game started in room ${roomCode}`);
    }
  });

  socket.on('submit_guess', ({ roomCode, guess }) => {
    const room = rooms[roomCode];
    if (!room || room.status !== 'playing' || room.currentTurn !== socket.id) return;

    const opponent = room.players.find(p => p.id !== socket.id);
    const feedback = getFeedback(guess, opponent.secret);

    const guessData = {
      playerId: socket.id,
      guess,
      exact: feedback.exact,
      numbers: feedback.numbers
    };

    room.history.push(guessData);
    room.currentTurn = opponent.id;

    if (feedback.exact === 4) {
      room.status = 'game_over';
      io.to(roomCode).emit('game_over', { winner: socket.id, history: room.history });
    } else {
      io.to(roomCode).emit('guess_result', { history: room.history, currentTurn: room.currentTurn });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [code, room] of Object.entries(rooms)) {
      if (room.players.some(p => p.id === socket.id)) {
        io.to(code).emit('player_disconnected');
        delete rooms[code];
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.send('Backend is running');
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io backend running on port ${PORT}`);
});
