// src/lib/socketServer.js — ALL Socket.io server logic for CipherClash
const crypto = require('crypto');

// In-memory room storage
const rooms = new Map();
// Session token → { roomCode, playerIndex } for reconnection
const sessions = new Map();
// Disconnect timers
const disconnectTimers = new Map();

const RECONNECT_GRACE_MS = 45000; // 45 seconds
const ROOM_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Helper: evaluate guess with CipherClash logic
function evaluateGuess(secret, guess) {
  let exact = 0;
  let numbers = 0;
  
  for (let i = 0; i < 4; i++) {
    // 1. Check if the digit exists ANYWHERE in the secret (Total Correct)
    if (secret.includes(guess[i])) {
      numbers++;
    }
    
    // 2. Check if the digit is in the EXACT correct spot (Position)
    if (guess[i] === secret[i]) {
      exact++;
    }
  }
  
  // Example: Secret 1234, Guess 1235 -> numbers: 3, exact: 3
  return { exact, numbers };
}

function isValidSecret(secret) {
  if (!secret || secret.length !== 4) return false;
  if (!/^\d+$/.test(secret)) return false;
  const unique = new Set(secret);
  return unique.size === 4;
}

function scheduleRoomCleanup(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  
  if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
  
  room.cleanupTimer = setTimeout(() => {
    const r = rooms.get(roomCode);
    if (r) {
      if (r.io) {
        r.io.to(roomCode).emit('room_expired', { message: 'Room expired due to inactivity' });
      }
      rooms.delete(roomCode);
      console.log(`[CLEANUP] Room ${roomCode} expired after inactivity`);
    }
  }, ROOM_TIMEOUT_MS);
}

function init(io) {
  io.on('connection', (socket) => {
    console.log(`[CONNECT] ${socket.id}`);
    
    // ─── HOST ROOM ───
    socket.on('host_room', ({ sessionToken }) => {
      if (!sessionToken) return socket.emit('error', { message: 'Session token required' });
      
      let roomCode;
      do {
        roomCode = generateRoomCode();
      } while (rooms.has(roomCode));
      
      const room = {
        code: roomCode,
        players: [
          { sessionToken, socketId: socket.id, secret: null, guessHistory: [], connected: true }
        ],
        currentTurn: 0,
        status: 'waiting',
        createdAt: Date.now(),
        io: io
      };
      
      rooms.set(roomCode, room);
      sessions.set(sessionToken, { roomCode, playerIndex: 0 });
      socket.join(roomCode);
      
      socket.emit('room_hosted', { roomCode });
      scheduleRoomCleanup(roomCode);
      console.log(`[HOST] Room ${roomCode} by session ${sessionToken.slice(0, 8)}...`);
    });
    
    // ─── JOIN ROOM ───
    socket.on('join_room', ({ sessionToken, roomCode }) => {
      if (!sessionToken) return socket.emit('error', { message: 'Session token required' });
      if (!roomCode) return socket.emit('error', { message: 'Room code required' });
      
      roomCode = roomCode.toUpperCase();
      const room = rooms.get(roomCode);
      
      if (!room) return socket.emit('error', { message: 'Room not found' });
      if (room.players.length >= 2) return socket.emit('error', { message: 'Room is full' });
      if (room.status !== 'waiting') return socket.emit('error', { message: 'Game already started' });
      
      const existing = room.players.find(p => p.sessionToken === sessionToken);
      if (existing) return socket.emit('error', { message: 'Already in this room' });
      
      room.players.push({
        sessionToken, socketId: socket.id, secret: null, guessHistory: [], connected: true
      });
      room.status = 'locking';
      
      sessions.set(sessionToken, { roomCode, playerIndex: 1 });
      socket.join(roomCode);
      
      io.to(roomCode).emit('player_joined', {
        playerCount: room.players.length,
        players: room.players.map((p, i) => ({ index: i, connected: p.connected }))
      });
      
      socket.emit('room_joined', { roomCode });
      scheduleRoomCleanup(roomCode);
      console.log(`[JOIN] Session ${sessionToken.slice(0, 8)}... joined room ${roomCode}`);
    });
    
    // ─── LOCK SECRET ───
    socket.on('lock_secret', ({ sessionToken, roomCode, secret }) => {
      const room = rooms.get(roomCode);
      if (!room) return socket.emit('error', { message: 'Room not found' });
      
      if (!isValidSecret(secret)) {
        return socket.emit('error', { message: 'Secret must be 4 unique digits' });
      }
      
      const player = room.players.find(p => p.sessionToken === sessionToken);
      if (!player) return socket.emit('error', { message: 'Not in this room' });
      
      player.secret = secret;
      socket.emit('secret_locked', { success: true });
      
      if (room.players.length === 2 && room.players.every(p => p.secret !== null)) {
        room.status = 'playing';
        room.currentTurn = 0;
        
        io.to(roomCode).emit('game_start', {
          currentTurn: room.players[room.currentTurn].sessionToken,
          players: room.players.map((p, i) => ({
            index: i,
            sessionToken: p.sessionToken,
            connected: p.connected
          }))
        });
        
        console.log(`[GAME START] Room ${roomCode}`);
      } else {
        io.to(roomCode).emit('lock_status', {
          lockedCount: room.players.filter(p => p.secret !== null).length
        });
      }
      
      scheduleRoomCleanup(roomCode);
    });
    
    // ─── MAKE GUESS ───
    socket.on('make_guess', ({ sessionToken, roomCode, guess }) => {
      const room = rooms.get(roomCode);
      if (!room || room.status !== 'playing') return;
      
      if (!isValidSecret(guess)) {
        return socket.emit('error', { message: 'Guess must be 4 unique digits' });
      }
      
      const playerIndex = room.players.findIndex(p => p.sessionToken === sessionToken);
      if (playerIndex === -1) return;
      if (playerIndex !== room.currentTurn) {
        return socket.emit('error', { message: 'Not your turn' });
      }
      
      const opponent = room.players[1 - playerIndex];
      const result = evaluateGuess(opponent.secret, guess);
      
      const guessEntry = {
        guess,
        exact: result.exact,
        numbers: result.numbers,
        timestamp: Date.now()
      };
      
      room.players[playerIndex].guessHistory.push(guessEntry);
      
      // WIN condition
      if (result.exact === 4) {
        room.status = 'game_over';
        
        io.to(roomCode).emit('game_over', {
          winner: sessionToken,
          loser: opponent.sessionToken,
          secrets: {
            [room.players[0].sessionToken]: room.players[0].secret,
            [room.players[1].sessionToken]: room.players[1].secret
          },
          history: {
            [room.players[0].sessionToken]: room.players[0].guessHistory,
            [room.players[1].sessionToken]: room.players[1].guessHistory
          }
        });
        
        if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
        setTimeout(() => rooms.delete(roomCode), 60000);
        return;
      }
      
      // Switch turn
      room.currentTurn = 1 - playerIndex;
      
      // ───  SEND BOTH HISTORIES TO BOTH PLAYERS ───
      // Both players can see each other's guesses (their attack against opponent's secret)
      const guesserSocket = io.sockets.sockets.get(room.players[playerIndex].socketId);
      if (guesserSocket) {
        guesserSocket.emit('guess_result', {
          myGuess: guessEntry,
          myHistory: room.players[playerIndex].guessHistory,
          opponentHistory: opponent.guessHistory,
          currentTurn: room.players[room.currentTurn].sessionToken
        });
      }
      
      const opponentSocket = io.sockets.sockets.get(opponent.socketId);
      if (opponentSocket) {
        opponentSocket.emit('guess_result', {
          myHistory: opponent.guessHistory,
          opponentHistory: room.players[playerIndex].guessHistory,
          currentTurn: room.players[room.currentTurn].sessionToken
        });
      }
      
      scheduleRoomCleanup(roomCode);
    });
    
    // ─── EMOJI REACT ───
    socket.on('emoji_react', ({ sessionToken, roomCode, emoji }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      const playerIndex = room.players.findIndex(p => p.sessionToken === sessionToken);
      if (playerIndex === -1) return;
      
      const opponent = room.players[1 - playerIndex];
      io.to(opponent.socketId).emit('emoji_received', { emoji, from: sessionToken });
    });

    // ─── CHAT MESSAGE ───
    socket.on('chat_message', ({ sessionToken, roomCode, message }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      
      const playerIndex = room.players.findIndex(p => p.sessionToken === sessionToken);
      if (playerIndex === -1) return;
      
      const opponent = room.players[1 - playerIndex];
      io.to(opponent.socketId).emit('chat_received', { message, from: sessionToken });
    });

    // ─── RECONNECTION ───
    socket.on('reconnect_session', ({ sessionToken }) => {
      const sessionData = sessions.get(sessionToken);
      if (!sessionData) return socket.emit('reconnect_failed', { message: 'No session found' });
      
      const room = rooms.get(sessionData.roomCode);
      if (!room) return socket.emit('reconnect_failed', { message: 'Room no longer exists' });
      
      const player = room.players[sessionData.playerIndex];
      if (!player || player.sessionToken !== sessionToken) {
        return socket.emit('reconnect_failed', { message: 'Session mismatch' });
      }
      
      const timerKey = `${sessionData.roomCode}_${sessionData.playerIndex}`;
      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
      }
      
      player.socketId = socket.id;
      player.connected = true;
      socket.join(sessionData.roomCode);
      
      const opponentIndex = 1 - sessionData.playerIndex;
      
      socket.emit('state_sync', {
        roomCode: sessionData.roomCode,
        status: room.status,
        playerIndex: sessionData.playerIndex,
        myHistory: player.guessHistory,
        opponentHistory: room.players[opponentIndex]?.guessHistory || [],
        currentTurn: room.status === 'playing' ? room.players[room.currentTurn].sessionToken : null,
        isSecretLocked: player.secret !== null,
        players: room.players.map((p, i) => ({
          index: i,
          sessionToken: p.sessionToken,
          connected: p.connected
        }))
      });
      
      io.to(sessionData.roomCode).emit('player_reconnected', {
        playerIndex: sessionData.playerIndex
      });
      
      console.log(`[RECONNECT] Session ${sessionToken.slice(0, 8)}... reconnected to room ${sessionData.roomCode}`);
    });
    
    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
      console.log(`[DISCONNECT] ${socket.id}`);
      
      for (const [roomCode, room] of rooms) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) continue;
        
        room.players[playerIndex].connected = false;
        
        if (room.status === 'waiting') {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
            rooms.delete(roomCode);
          }
          io.to(roomCode).emit('player_left', { playerIndex });
          return;
        }
        
        const timerKey = `${roomCode}_${playerIndex}`;
        io.to(roomCode).emit('player_disconnected_temp', {
          playerIndex,
          gracePeriodMs: RECONNECT_GRACE_MS
        });
        
        const timer = setTimeout(() => {
          const r = rooms.get(roomCode);
          if (!r) return;
          
          const p = r.players[playerIndex];
          if (p && !p.connected) {
            const opponentIndex = 1 - playerIndex;
            r.status = 'game_over';
            
            io.to(roomCode).emit('game_over', {
              winner: r.players[opponentIndex].sessionToken,
              loser: p.sessionToken,
              reason: 'disconnect_timeout',
              secrets: {
                [r.players[0].sessionToken]: r.players[0].secret,
                [r.players[1].sessionToken]: r.players[1].secret
              },
              history: {
                [r.players[0].sessionToken]: r.players[0].guessHistory,
                [r.players[1].sessionToken]: r.players[1].guessHistory
              }
            });
            
            console.log(`[TIMEOUT] Player ${playerIndex} timed out in room ${roomCode}`);
          }
          
          disconnectTimers.delete(timerKey);
        }, RECONNECT_GRACE_MS);
        
        disconnectTimers.set(timerKey, timer);
        break;
      }
    });
  });
  
  console.log('[SOCKET] CipherClash socket server initialized');
}

module.exports = { init };
