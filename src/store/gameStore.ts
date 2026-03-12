import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───
export type GameMode = 'menu' | 'pve' | 'pvp-lobby' | 'pvp-locking' | 'pvp-game';
export type PvpStatus = 'idle' | 'waiting' | 'locking' | 'playing' | 'game_over';

export interface GuessRecord {
  guess: string;
  exact: number;
  numbers: number;
  timestamp?: number;
}

export interface PlayerInfo {
  index: number;
  sessionToken: string;
  connected: boolean;
}

// ─── Session Token (persisted in localStorage) ───
function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('cc_session_token');
  if (!token) {
    token = uuidv4();
    localStorage.setItem('cc_session_token', token);
  }
  return token;
}

function getGuestAlias(): string {
  if (typeof window === 'undefined') return 'guest';
  let alias = localStorage.getItem('cc_guest_alias');
  if (!alias) {
    const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
    alias = `phantom_0x${hex}`;
    localStorage.setItem('cc_guest_alias', alias);
  }
  return alias;
}

// ─── Store Interface ───
interface GameState {
  // Navigation
  mode: GameMode;
  setMode: (mode: GameMode) => void;

  // Session
  sessionToken: string;
  guestAlias: string;

  // Authentication
  isLoggedIn: boolean;
  userName: string | null;
  setUser: (name: string | null) => void;
  credits: number;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;

  // PvE State
  pveSecret: string | null;
  setPveSecret: (secret: string) => void;
  pveHistory: GuessRecord[];
  addPveGuess: (record: GuessRecord) => void;
  pveGameOver: boolean;
  setPveGameOver: (val: boolean) => void;
  resetPve: () => void;

  // PvP Socket
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
  
  // PvP Room State
  roomCode: string | null;
  pvpStatus: PvpStatus;
  players: PlayerInfo[];
  myPlayerIndex: number;
  isSecretLocked: boolean;
  lockedCount: number;
  currentTurn: string | null;
  myHistory: GuessRecord[];
  opponentHistory: GuessRecord[];
  winner: string | null;
  loser: string | null;
  gameOverReason: string | null;
  revealedSecrets: Record<string, string>;
  
  // Emoji & Chat
  receivedEmoji: { emoji: string; timestamp: number } | null;
  sendEmoji: (emoji: string) => void;
  receivedChat: { message: string; timestamp: number } | null;
  sendChat: (message: string) => void;

  // Opponent disconnect
  opponentDisconnected: boolean;
  gracePeriodMs: number;

  // Error
  errorMessage: string | null;
  clearError: () => void;

  // PvP Actions
  hostRoom: () => void;
  joinRoom: (code: string) => void;
  lockSecret: (secret: string) => void;
  makeGuess: (guess: string) => void;
  resetPvp: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // ─── Navigation ───
  mode: 'menu',
  setMode: (mode) => set({ mode }),

  // ─── Session ───
  sessionToken: typeof window !== 'undefined' ? getSessionToken() : '',
  guestAlias: typeof window !== 'undefined' ? getGuestAlias() : 'guest',

  // ─── Auth & Currency ───
  isLoggedIn: false,
  userName: null,
  setUser: (name) => set({ isLoggedIn: !!name, userName: name }),
  credits: typeof window !== 'undefined' ? parseInt(localStorage.getItem('cc_credits') || '1000') : 1000,
  addCredits: (amount) => set((state) => {
    const newCredits = state.credits + amount;
    if (typeof window !== 'undefined') localStorage.setItem('cc_credits', newCredits.toString());
    return { credits: newCredits };
  }),
  removeCredits: (amount) => set((state) => {
    const newCredits = Math.max(0, state.credits - amount);
    if (typeof window !== 'undefined') localStorage.setItem('cc_credits', newCredits.toString());
    return { credits: newCredits };
  }),

  // ─── PvE ───
  pveSecret: null,
  setPveSecret: (pveSecret) => set({ pveSecret }),
  pveHistory: [],
  addPveGuess: (record) => set((s) => ({ pveHistory: [...s.pveHistory, record] })),
  pveGameOver: false,
  setPveGameOver: (pveGameOver) => set({ pveGameOver }),
  resetPve: () => set({ pveSecret: null, pveHistory: [], pveGameOver: false }),

  // ─── Socket ───
  socket: null,
  connectSocket: () => {
    if (get().socket?.connected) return;
    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    
    set({ socket });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
      const sessionToken = get().sessionToken;
      if (sessionToken) {
        socket.emit('reconnect_session', { sessionToken });
      }
    });

    // ─── Room Events ───
    socket.on('room_hosted', ({ roomCode }) => {
      set({ roomCode, pvpStatus: 'waiting', players: [] });
    });

    socket.on('room_joined', ({ roomCode }) => {
      set({ roomCode });
    });

    socket.on('player_joined', ({ playerCount, players }) => {
      set({ 
        players, 
        pvpStatus: playerCount === 2 ? 'locking' : 'waiting',
        myPlayerIndex: players.findIndex((p: PlayerInfo) => p.sessionToken === get().sessionToken) 
      });
    });

    // ─── Lock Events ───
    socket.on('secret_locked', () => {
      set({ isSecretLocked: true });
    });

    socket.on('lock_status', ({ lockedCount }) => {
      set({ lockedCount });
    });

    // ─── Game Events ───
    socket.on('game_start', ({ currentTurn, players }) => {
      set({
        pvpStatus: 'playing',
        mode: 'pvp-game',
        currentTurn,
        players,
        myPlayerIndex: players.findIndex((p: PlayerInfo) => p.sessionToken === get().sessionToken)
      });
    });

    socket.on('guess_result', ({ myHistory, opponentHistory, currentTurn }) => {
      set({
        myHistory: myHistory || get().myHistory,
        opponentHistory: opponentHistory || get().opponentHistory,
        currentTurn
      });
    });

    socket.on('game_over', ({ winner, loser, reason, secrets, history }) => {
      const sessionToken = get().sessionToken;
      const opponentToken = winner === sessionToken ? loser : winner;
      set({
        pvpStatus: 'game_over',
        winner,
        loser,
        gameOverReason: reason || 'cracked',
        revealedSecrets: secrets || {},
        myHistory: history?.[sessionToken] || get().myHistory,
        opponentHistory: history?.[opponentToken] || get().opponentHistory,
      });
    });

    // ─── Emoji & Chat Events ───
    socket.on('emoji_received', ({ emoji }) => {
      set({ receivedEmoji: { emoji, timestamp: Date.now() } });
      setTimeout(() => set({ receivedEmoji: null }), 3000);
    });

    socket.on('chat_received', ({ message }) => {
      set({ receivedChat: { message, timestamp: Date.now() } });
      setTimeout(() => set({ receivedChat: null }), 5000);
    });

    // ─── Reconnection Events ───
    socket.on('state_sync', (state) => {
      set({
        roomCode: state.roomCode,
        pvpStatus: state.status === 'game_over' ? 'game_over' : state.status,
        myPlayerIndex: state.playerIndex,
        myHistory: state.myHistory,
        opponentHistory: state.opponentHistory || [],
        currentTurn: state.currentTurn,
        isSecretLocked: state.isSecretLocked,
        players: state.players,
        mode: state.status === 'playing' ? 'pvp-game' : 'pvp-lobby',
      });
    });

    socket.on('player_disconnected_temp', ({ gracePeriodMs }) => {
      set({ opponentDisconnected: true, gracePeriodMs });
    });

    socket.on('player_reconnected', () => {
      set({ opponentDisconnected: false });
    });

    socket.on('player_left', () => {
      set({ pvpStatus: 'waiting', players: [] });
    });

    socket.on('room_expired', () => {
      set({ errorMessage: 'Room expired due to inactivity' });
      get().resetPvp();
    });

    socket.on('reconnect_failed', () => {
      // No active session, that's fine
    });

    socket.on('error', ({ message }) => {
      set({ errorMessage: message });
      setTimeout(() => set({ errorMessage: null }), 4000);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  // ─── PvP Room State ───
  roomCode: null,
  pvpStatus: 'idle',
  players: [],
  myPlayerIndex: -1,
  isSecretLocked: false,
  lockedCount: 0,
  currentTurn: null,
  myHistory: [],
  opponentHistory: [],
  winner: null,
  loser: null,
  gameOverReason: null,
  revealedSecrets: {},
  receivedEmoji: null,
  receivedChat: null,
  opponentDisconnected: false,
  gracePeriodMs: 0,
  errorMessage: null,

  clearError: () => set({ errorMessage: null }),

  // ─── PvP Actions ───
  hostRoom: () => {
    const { socket, sessionToken } = get();
    if (socket) socket.emit('host_room', { sessionToken });
  },

  joinRoom: (code: string) => {
    const { socket, sessionToken } = get();
    if (socket) socket.emit('join_room', { sessionToken, roomCode: code.toUpperCase() });
  },

  lockSecret: (secret: string) => {
    const { socket, sessionToken, roomCode } = get();
    if (socket && roomCode) {
      socket.emit('lock_secret', { sessionToken, roomCode, secret });
    }
  },

  makeGuess: (guess: string) => {
    const { socket, sessionToken, roomCode } = get();
    if (socket && roomCode) {
      socket.emit('make_guess', { sessionToken, roomCode, guess });
    }
  },

  sendEmoji: (emoji: string) => {
    const { socket, sessionToken, roomCode } = get();
    if (socket && roomCode) {
      socket.emit('emoji_react', { sessionToken, roomCode, emoji });
    }
  },

  sendChat: (message: string) => {
    const { socket, sessionToken, roomCode } = get();
    if (socket && roomCode && message.trim()) {
      socket.emit('chat_message', { sessionToken, roomCode, message: message.trim() });
    }
  },

  resetPvp: () => set({
    roomCode: null,
    pvpStatus: 'idle',
    players: [],
    myPlayerIndex: -1,
    isSecretLocked: false,
    lockedCount: 0,
    currentTurn: null,
    myHistory: [],
    opponentHistory: [],
    winner: null,
    loser: null,
    gameOverReason: null,
    revealedSecrets: {},
    receivedEmoji: null,
    opponentDisconnected: false,
    mode: 'menu'
  }),
}));
