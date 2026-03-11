'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { generateSecret, getFeedback } from '@/lib/gameLogic';
import GuessHistory from '@/components/GuessHistory';
import InputKeypad from '@/components/InputKeypad';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PveGame() {
  const { pveSecret, setPveSecret, pveHistory, addPveGuess, pveGameOver, setPveGameOver, setMode, resetPve } = useGameStore();

  useEffect(() => {
    if (!pveSecret) {
      setPveSecret(generateSecret());
    }
  }, [pveSecret, setPveSecret]);

  const handleGuess = (guess: string) => {
    if (!pveSecret || pveGameOver) return;
    const { exact, numbers } = getFeedback(guess, pveSecret);
    addPveGuess({ guess, exact, numbers });
    
    if (exact === 4) {
      setPveGameOver(true);
    }
  };

  const handleBack = () => {
    resetPve();
    setMode('menu');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-slate-950 w-full relative overflow-hidden">
      {/* Background Matrix-like abstract elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 pb-4 border-b border-slate-800 z-10 relative">
        <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors flex items-center bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-500 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-mono text-sm tracking-widest">ABORT</span>
        </button>
        <div className="flex items-center space-x-3 bg-slate-900/50 px-6 py-2 rounded-lg border border-green-500/30 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-pulse" />
          <h2 className="text-xl font-bold font-mono text-green-400 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">PVE.MODE :: ACTIVE</h2>
        </div>
      </div>

      {pveGameOver && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl mb-8 p-8 glass-panel border border-green-500 shadow-[0_0_30px_rgba(57,255,20,0.2)] text-center relative z-20 overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 translate-y-full hover:translate-y-0 transition-transform duration-500" />
          <h3 className="text-4xl font-bold text-green-400 mb-2 font-mono drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">SYSTEM BREACHED</h3>
          <p className="text-slate-300 font-mono mb-6 text-lg tracking-widest">CRACKED IN <span className="text-white font-bold">{pveHistory.length}</span> ATTEMPTS</p>
          <button onClick={handleBack} className="px-8 py-3 bg-neon-green text-slate-950 font-bold font-mono tracking-widest rounded transition hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(57,255,20,0.4)]">RETURN TO MENU</button>
        </motion.div>
      )}

      {/* 2-Column Game Board Layout */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl flex-1 z-10 relative">
        {/* Left Column: History */}
        <div className="w-full md:w-[55%] flex flex-col h-[60vh] md:h-auto border border-slate-800 rounded-xl bg-slate-900/30 backdrop-blur-md overflow-hidden relative shadow-inner">
          <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-center backdrop-blur-xl">
             <h4 className="text-slate-400 font-mono tracking-widest text-sm">TRANSACTION LOG</h4>
             <span className="text-slate-500 font-mono text-xs">ATTEMPTS: {pveHistory.length}</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <GuessHistory history={pveHistory} />
          </div>
        </div>

        {/* Right Column: Input */}
        <div className="w-full md:w-[45%] flex flex-col justify-center">
          <div className="glass-panel p-6 border-slate-700/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 opacity-50" />
            <h4 className="text-slate-400 font-mono text-sm tracking-[0.2em] mb-4 text-center">INPUT DECODER</h4>
            <InputKeypad onSubmit={handleGuess} disabled={pveGameOver} />
          </div>
        </div>
      </div>
    </main>
  );
}
