'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Gamepad2, Shield } from 'lucide-react';
import GuessHistory from '@/components/GuessHistory';
import InputKeypad from '@/components/InputKeypad';

export default function PvpLobby() {
  const { 
    mode, setMode, connectSocket, roomCode, players, 
    pvpStatus, isSecretLocked, socket, pvpHistory, currentTurn, winner, socketId 
  } = useGameStore();

  const [joinCode, setJoinCode] = useState('');
  
  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  const handleCreateRoom = () => {
    if (socket) socket.emit('create_room');
  };

  const handleJoinRoom = () => {
    if (socket && joinCode.length === 5) {
      socket.emit('join_room', joinCode.toUpperCase());
    }
  };

  const handleSetSecret = (secret: string) => {
    if (socket && roomCode) {
      socket.emit('set_secret', { roomCode, secret });
    }
  };

  const handleGuess = (guess: string) => {
    if (socket && roomCode && currentTurn === socketId) {
      socket.emit('submit_guess', { roomCode, guess });
    }
  };

  const handleBack = () => {
    setMode('menu');
  };

  // 1. LOBBY - Create / Join
  if (pvpStatus === 'waiting' && !roomCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          <button onClick={handleBack} className="text-slate-400 hover:text-white mb-8 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" /> ABORT
          </button>
          
          <div className="grid gap-6">
            <div className="glass-panel p-6 text-center">
              <Gamepad2 className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-mono text-white mb-4">HOST MATCH</h2>
              <button 
                onClick={handleCreateRoom}
                className="w-full py-3 bg-neon-blue font-bold font-mono text-white rounded hover:bg-blue-600 transition"
              >
                CREATE ROOM
              </button>
            </div>

            <div className="glass-panel p-6 text-center">
              <h2 className="text-2xl font-bold font-mono text-white mb-4">JOIN MATCH</h2>
              <input 
                type="text"
                placeholder="INVITE CODE (5 CHARS)"
                className="w-full bg-slate-800 text-white font-mono text-center text-xl tracking-widest py-3 rounded mb-4"
                maxLength={5}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button 
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 5}
                className="w-full py-3 border border-blue-500 text-blue-400 font-bold font-mono rounded hover:bg-blue-500 hover:text-white disabled:opacity-50 transition"
              >
                CONNECT
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. WAITING FOR PLAYERS
  if (pvpStatus === 'waiting' && players.length < 2) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <h2 className="text-2xl font-bold font-mono text-white mb-2">ROOM ESTABLISHED</h2>
        <p className="text-slate-400 mb-8 font-mono">WAITING FOR OPPONENT TO CONNECT...</p>
        
        <div className="glass-panel p-8 inline-block neon-border-blue">
          <p className="text-sm font-bold text-blue-400 mb-2 font-mono">SECURE INVITE CODE</p>
          <div className="text-6xl font-black text-white tracking-widest">{roomCode}</div>
        </div>
      </main>
    );
  }

  // 3. SETTING SECRET
  if (pvpStatus === 'waiting' && players.length === 2) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md text-center mb-8">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(19,91,236,0.8)]" />
          <h2 className="text-2xl font-bold font-mono text-white mb-2">SECURE YOUR CIPHER</h2>
          <p className="text-slate-400 font-mono text-sm leading-relaxed">
            {isSecretLocked 
              ? "WAITING FOR OPPONENT TO LOCK IN..."
              : "ENTER YOUR 4-DIGIT UNIQUE CODE. YOUR OPPONENT MUST CRACK THIS."}
          </p>
        </div>
        
        <div className="w-full max-w-md opacity-100">
          <InputKeypad onSubmit={handleSetSecret} disabled={isSecretLocked} />
        </div>
      </main>
    );
  }

  // 4. PLAYING / GAME OVER
  const isMyTurn = currentTurn === socketId;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-slate-950 w-full relative overflow-hidden">
      {/* Background Matrix-like abstract elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-slate-800 z-10 relative">
        <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors flex items-center bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-500 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-mono text-sm tracking-widest">ABORT</span>
        </button>

        <div className="font-mono text-sm tracking-widest text-slate-400">ROOM ID // <span className="text-white font-bold">{roomCode}</span></div>

        <div className={`font-mono text-sm px-6 py-2 rounded-lg border backdrop-blur-sm flex items-center space-x-2 
          ${pvpStatus === 'game_over' ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : isMyTurn ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(19,91,236,0.5)]' 
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}`}>
          {isMyTurn && pvpStatus !== 'game_over' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse glow-pulse" />}
          <span>
            {pvpStatus === 'game_over' 
              ? winner === socketId ? 'VICTORY' : 'DEFEAT'
              : isMyTurn ? 'YOUR MOVE' : 'OPPONENT\'S SECONDS'}
          </span>
        </div>
      </div>

      {pvpStatus === 'game_over' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-3xl mb-8 p-8 glass-panel border border-${winner === socketId ? 'green' : 'red'}-500 text-center relative z-20 overflow-hidden shadow-[0_0_30px_rgba(${winner === socketId ? '57,255,20' : '239,68,68'},0.2)]`}>
          <div className={`absolute inset-0 bg-${winner === socketId ? 'green' : 'red'}-500/5 translate-y-full hover:translate-y-0 transition-transform duration-500`} />
          <h3 className={`text-4xl font-bold mb-2 font-mono text-${winner === socketId ? 'green' : 'red'}-400 drop-shadow-[0_0_10px_rgba(${winner === socketId ? '57,255,20' : '239,68,68'},0.8)]`}>
            {winner === socketId ? 'SYSTEM BREACHED' : 'SYSTEM CRITICAL (BREACHED)'}
          </h3>
          <p className="text-slate-300 font-mono mb-6 text-lg tracking-widest">
            {winner === socketId ? 'YOU SUCCESSFULLY HACKED IN.' : 'OPPONENT OVERRODE YOUR SECRETS.'}
          </p>
          <button onClick={() => setMode('menu')} className={`px-8 py-3 bg-${winner === socketId ? 'neon-green' : 'red-600'} text-${winner === socketId ? 'slate-950' : 'white'} font-bold font-mono tracking-widest rounded transition hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(${winner === socketId ? '57,255,20' : '239,68,68'},0.4)]`}>
            RETURN TO BASE
          </button>
        </motion.div>
      )}

      {/* 3-Column Game Board Layout for PvP */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl flex-1 z-10 relative">
        
        {/* Left Column: Player 1 History */}
        <div className="w-full md:w-1/3 flex flex-col h-[40vh] md:h-auto border border-slate-800 rounded-xl bg-slate-900/30 backdrop-blur-md overflow-hidden relative shadow-inner">
          <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex justify-between items-center backdrop-blur-xl">
             <h4 className="text-slate-400 font-mono tracking-widest text-xs">P1 TRAFFIC</h4>
             <span className="text-slate-500 font-mono text-xs text-right truncate ml-2">
               {players[0] === socketId ? 'YOU' : 'OPPONENT'}
             </span>
          </div>
          <div className="flex-1 p-2 overflow-y-auto custom-scrollbar flex flex-col justify-end">
            <GuessHistory history={pvpHistory.filter(h => h.playerId === players[0])} />
          </div>
        </div>

        {/* Center Column: Input */}
        <div className="w-full md:w-1/3 flex flex-col justify-center relative">
           {!isMyTurn && pvpStatus !== 'game_over' && (
            <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center rounded-xl border border-slate-800">
              <span className="font-mono text-blue-400 animate-pulse tracking-widest text-sm">AWAITING OPPONENT...</span>
            </div>
          )}
          <div className="glass-panel p-4 md:p-6 border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 opacity-50" />
            <h4 className="text-slate-400 font-mono text-sm tracking-[0.2em] mb-4 text-center">ATTACK VECTOR</h4>
            <InputKeypad onSubmit={handleGuess} disabled={!isMyTurn || pvpStatus === 'game_over'} />
          </div>
        </div>

        {/* Right Column: Player 2 History */}
        <div className="w-full md:w-1/3 flex flex-col h-[40vh] md:h-auto border border-slate-800 rounded-xl bg-slate-900/30 backdrop-blur-md overflow-hidden relative shadow-inner">
          <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex justify-between items-center backdrop-blur-xl">
             <h4 className="text-slate-400 font-mono tracking-widest text-xs">P2 TRAFFIC</h4>
             <span className="text-slate-500 font-mono text-xs text-right truncate ml-2">
               {players.length > 1 ? (players[1] === socketId ? 'YOU' : 'OPPONENT') : 'WAITING...'}
             </span>
          </div>
          <div className="flex-1 p-2 overflow-y-auto custom-scrollbar flex flex-col justify-end">
             <GuessHistory history={pvpHistory.filter(h => h.playerId === players[1])} />
          </div>
        </div>

      </div>
    </main>
  );
}
