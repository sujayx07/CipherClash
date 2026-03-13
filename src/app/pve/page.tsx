'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateSecret, getFeedback } from '@/lib/gameLogic';
import { useGameStore } from '@/store/gameStore';
import InputKeypad from '@/components/InputKeypad';
import GuessHistory from '@/components/GuessHistory';
import WinScreen from '@/components/WinScreen';

interface PveGuess {
  guess: string;
  exact: number;
  numbers: number;
}

export default function PvePage() {
  const router = useRouter();
  const { status } = useSession();
  const { guestAlias } = useGameStore();
  const [secret, setSecret] = useState<string>(() => generateSecret());
  const [history, setHistory] = useState<PveGuess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const handleGuess = (guess: string) => {
    if (!secret || gameOver) return;
    const { exact, numbers } = getFeedback(guess, secret);
    const entry: PveGuess = { guess, exact, numbers };
    const nextHistory = [...history, entry];
    setHistory(nextHistory);

    if (exact === 4) {
      setGameOver(true);
      if (!resultSubmitted) {
        setResultSubmitted(true);
        void fetch('/api/leaderboard', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(status !== 'authenticated' ? { 'x-cc-guest-alias': guestAlias } : {}),
          },
          body: JSON.stringify({
            mode: 'pve',
            result: 'win',
            guesses_taken: nextHistory.length,
          }),
        }).catch(() => {
          // Ignore transient network/database errors during result reporting.
        });
      }
    }
  };

  const handleRestart = () => {
    setSecret(generateSecret());
    setHistory([]);
    setGameOver(false);
    setResultSubmitted(false);
  };

  return (
    <>
      {/* Win screen overlay */}
      <AnimatePresence>
        {gameOver && (
          <WinScreen
            guessCount={history.length}
            onContinue={() => router.push('/')}
          />
        )}
      </AnimatePresence>

      <main
        className="min-h-screen relative overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.04) 0%, transparent 60%)' }} className="absolute inset-0" />
          <div className="absolute inset-0 matrix-grid opacity-30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                border: '1px solid rgba(74,85,104,0.2)',
                letterSpacing: '0.1em',
              }}
            >
              ← ABORT
            </button>

            <div className="flex items-center gap-3">
              <span className="status-dot connected" />
              <span
                className="text-sm font-bold tracking-widest"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--accent-green)',
                  textShadow: '0 0 8px rgba(0,255,136,0.5)',
                }}
              >
                PVE :: ACTIVE
              </span>
            </div>

            <div
              className="px-4 py-2 rounded-lg"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(74,85,104,0.2)',
              }}
            >
              ATTEMPTS: <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{history.length}</span>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: History */}
            <div className="w-full md:w-[55%]">
              <div className="glass-panel overflow-hidden" style={{ minHeight: '400px' }}>
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}
                >
                  <span
                    className="text-xs uppercase tracking-widest opacity-50"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
                  >
                    Transaction Log
                  </span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
                  >
                    {history.length} entries
                  </span>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <GuessHistory history={history} />
                </div>
              </div>
            </div>

            {/* Right: Keypad */}
            <div className="w-full md:w-[45%] flex flex-col justify-center">
              <div className="glass-panel p-6 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full h-0.5"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--accent-green), transparent)' }}
                />
                <p
                  className="text-center text-xs uppercase tracking-widest mb-5 opacity-50"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
                >
                  Input Decoder
                </p>
                <InputKeypad onSubmit={handleGuess} disabled={gameOver} />
              </div>

              {/* Restart button */}
              {gameOver && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleRestart}
                  className="mt-4 btn-neon-green btn-neon text-xs w-full"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  NEW MISSION
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
