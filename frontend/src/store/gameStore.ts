import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type GameMode = 'menu' | 'pve' | 'pvp-lobby' | 'pvp-game';

export interface GuessRecord {
  playerId?: string;
  guess: string;
  exact: number;
  numbers: number;
}

interface GameState {
  mode: GameMode;
  setMode: (mode: GameMode) => void;

  // PvE State
  pveSecret: string | null;
  setPveSecret: (secret: string) => void;
  pveHistory: GuessRecord[];
  addPveGuess: (record: GuessRecord) => void;
  resetPve: () => void;
  pveGameOver: boolean;
  setPveGameOver: (val: boolean) => void;

  // PvP Socket State
  socket: Socket | null;
  connectSocket: () => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  players: string[];
  setPlayers: (p: string[]) => void;
  isSecretLocked: boolean;
  setSecretLocked: (status: boolean) => void;
  pvpHistory: GuessRecord[];
  setPvpHistory: (history: GuessRecord[]) => void;
  currentTurn: string | null;
  setCurrentTurn: (turn: string | null) => void;
  pvpStatus: 'waiting' | 'playing' | 'game_over';
  setPvpStatus: (status: 'waiting' | 'playing' | 'game_over') => void;
  winner: string | null;
  setWinner: (winner: string | null) => void;

  socketId: string | null;
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'menu',
  setMode: (mode) => set({ mode }),

  pveSecret: null,
  setPveSecret: (pveSecret) => set({ pveSecret }),
  pveHistory: [],
  addPveGuess: (record) => set((state) => ({ pveHistory: [...state.pveHistory, record] })),
  resetPve: () => set({ pveSecret: null, pveHistory: [], pveGameOver: false }),
  pveGameOver: false,
  setPveGameOver: (pveGameOver) => set({ pveGameOver }),

  socket: null,
  socketId: null,
  connectSocket: () => {
    if (get().socket) return;
    // Connect to the external backend server
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';
    const socket = io(SOCKET_URL);
    set({ socket });

    socket.on('connect', () => {
      set({ socketId: socket.id });
    });

    socket.on('room_created', (code) => {
      set({ roomCode: code, players: [socket.id!] });
    });

    socket.on('room_joined', (code) => {
      set({ roomCode: code });
    });

    socket.on('player_joined', (players) => {
      set({ players });
    });

    socket.on('secret_locked', () => {
      set({ isSecretLocked: true });
    });

    socket.on('game_start', ({ turn, players }) => {
      set({ currentTurn: turn, players, pvpStatus: 'playing', mode: 'pvp-game' });
    });

    socket.on('guess_result', ({ history, currentTurn }) => {
      set({ pvpHistory: history, currentTurn });
    });

    socket.on('game_over', ({ winner, history }) => {
      set({ winner, pvpHistory: history, pvpStatus: 'game_over' });
    });

    socket.on('player_disconnected', () => {
      alert('Opponent disconnected!');
      set({ mode: 'menu', roomCode: null, players: [], isSecretLocked: false, pvpHistory: [], currentTurn: null, pvpStatus: 'waiting', winner: null });
    });

    socket.on('error', (msg) => {
      alert(`Error: ${msg}`);
    });
  },
  
  roomCode: null,
  setRoomCode: (roomCode) => set({ roomCode }),
  players: [],
  setPlayers: (players) => set({ players }),
  isSecretLocked: false,
  setSecretLocked: (isSecretLocked) => set({ isSecretLocked }),
  pvpHistory: [],
  setPvpHistory: (pvpHistory) => set({ pvpHistory }),
  currentTurn: null,
  setCurrentTurn: (currentTurn) => set({ currentTurn }),
  pvpStatus: 'waiting',
  setPvpStatus: (pvpStatus) => set({ pvpStatus }),
  winner: null,
  setWinner: (winner) => set({ winner })
}));
