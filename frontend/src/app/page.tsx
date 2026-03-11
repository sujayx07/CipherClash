'use client';

import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { Terminal, Cpu } from 'lucide-react';
import PveGame from '@/app/pve/page';
import PvpLobby from '@/app/pvp/page';

export default function Home() {
  const { mode, setMode } = useGameStore();

  if (mode === 'pve') return <PveGame />;
  if (mode === 'pvp-lobby' || mode === 'pvp-game') return <PvpLobby />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(37,157,244,0.5)]">
          CIPHER_CLASH
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-mono tracking-widest">
          SYS.BREACH_PROTOCOL.INIT()
        </p>
      </motion.div>

      <div className="relative z-10 grid gap-6 md:grid-cols-2 max-w-4xl w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('pve')}
          className="group relative flex flex-col items-center p-8 glass-panel hover:neon-border-green transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Cpu className="w-12 h-12 text-green-400 mb-4 drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] glow-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">PVE MATCH</h2>
          <p className="text-slate-400 text-sm font-mono text-center">BREAK THE SYSTEM AI. CRACK THE 4-DIGIT PIN.</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('pvp-lobby')}
          className="group relative flex flex-col items-center p-8 glass-panel hover:neon-border-blue transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Terminal className="w-12 h-12 text-blue-400 mb-4 drop-shadow-[0_0_8px_rgba(19,91,236,0.8)] glow-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">1v1 MULTIPLAYER</h2>
          <p className="text-slate-400 text-sm font-mono text-center">CHALLENGE A RIVAL HACKER. ESTABLISH SECURE LINK.</p>
        </motion.button>
      </div>

    </main>
  );
}
