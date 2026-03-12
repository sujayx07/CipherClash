'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import InputKeypad from '@/components/InputKeypad';
import GuessHistory from '@/components/GuessHistory';
import EmojiReact from '@/components/EmojiReact';
import ChatWidget from '@/components/ChatWidget';
import WinScreen from '@/components/WinScreen';
import LossScreen from '@/components/LossScreen';

export default function PvpPage() {
  const router = useRouter();
  const {
    sessionToken, roomCode, pvpStatus, currentTurn, myHistory,
    opponentHistory, winner, loser, gameOverReason,
    receivedEmoji, sendEmoji, receivedChat, sendChat, makeGuess, resetPvp,
    opponentDisconnected, gracePeriodMs, connectSocket,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    connectSocket();
  }, [connectSocket]);

  useEffect(() => {
    if (mounted && !roomCode && pvpStatus !== 'playing' && pvpStatus !== 'game_over') {
      router.push('/lobby');
    }
  }, [mounted, roomCode, pvpStatus, router]);

  if (!mounted) return null;

  const isMyTurn = currentTurn === sessionToken;
  const isWinner = winner === sessionToken;
  const isGameOver = pvpStatus === 'game_over';

  // ─── WIN/LOSS OVERLAYS ───
  if (isGameOver && isWinner) {
    return <WinScreen guessCount={myHistory.length} onContinue={() => { resetPvp(); router.push('/'); }} />;
  }

  if (isGameOver && !isWinner) {
    return <LossScreen reason={gameOverReason || undefined} onContinue={() => { resetPvp(); router.push('/'); }} />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div className="absolute inset-0 matrix-grid opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <button
            onClick={() => { resetPvp(); router.push('/'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              border: '1px solid rgba(74,85,104,0.2)',
              letterSpacing: '0.1em',
            }}
          >
            ← ABORT
          </button>

          {/* Room code + connection */}
          <div className="flex items-center gap-3">
            <span className={`status-dot ${opponentDisconnected ? 'disconnected' : 'connected'}`} />
            <span
              className="text-xs tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
            >
              ROOM <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{roomCode}</span>
            </span>
          </div>

          {/* Turn indicator */}
          <div
            className="px-5 py-2 rounded-lg transition-all duration-500"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              background: isMyTurn ? 'rgba(0,245,255,0.08)' : 'rgba(74,85,104,0.08)',
              border: `1px solid ${isMyTurn ? 'rgba(0,245,255,0.3)' : 'rgba(74,85,104,0.2)'}`,
              color: isMyTurn ? 'var(--accent-cyan)' : 'var(--text-dim)',
              letterSpacing: '0.15em',
            }}
          >
            {isMyTurn ? '⚡ YOUR TURN' : '⏳ WAITING...'}
          </div>
        </div>

        {/* ─── DISCONNECT WARNING ─── */}
        {opponentDisconnected && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-xs text-center"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'rgba(255,51,102,0.1)',
                border: '1px solid rgba(255,51,102,0.3)',
                color: 'var(--accent-red)',
                letterSpacing: '0.1em',
              }}
            >
              ⚠ OPPONENT DISCONNECTED — WAITING {Math.ceil(gracePeriodMs / 1000)}s FOR RECONNECT
            </div>
          )}
        {/* ─── THREE-COLUMN GAME BOARD ─── */}
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* ═══ LEFT: YOUR ATTACK ═══ */}
          <div className="w-full lg:w-[38%]">
            <div className="glass-panel overflow-hidden" style={{ minHeight: '450px' }}>
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(0,255,136,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
                  <span
                    className="text-xs uppercase tracking-widest font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}
                  >
                    Your Attack
                  </span>
                </div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
                  {myHistory.length} attempts
                </span>
              </div>
              <div className="p-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
                <GuessHistory
                  history={myHistory.map(h => ({
                    guess: h.guess,
                    exact: h.exact,
                    numbers: h.numbers,
                  }))}
                />
              </div>
            </div>
          </div>

          {/* ═══ CENTER: KEYPAD + EMOJI ═══ */}
          <div className="w-full lg:w-[24%] flex flex-col gap-3">
            <div className="glass-panel p-4 relative overflow-hidden flex-1">
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${isMyTurn ? 'var(--accent-cyan)' : 'var(--text-dim)'}, transparent)`,
                  opacity: isMyTurn ? 1 : 0.3,
                }}
              />
              <p
                className="text-center text-xs uppercase tracking-widest mb-3 opacity-50"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
              >
                Attack Vector
              </p>

              {!isMyTurn && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
                  style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(4px)' }}
                >
                  <span
                    className="text-xs tracking-widest animate-pulse-glow"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
                  >
                    OPPONENT&apos;S TURN
                  </span>
                </div>
              )}

              <InputKeypad onSubmit={makeGuess} disabled={!isMyTurn || isGameOver} />
            </div>

            {/* Emoji */}
            <div className="glass-panel p-3 flex justify-center">
              <EmojiReact
                emoji={receivedEmoji}
                onSend={sendEmoji}
                disabled={isGameOver}
              />
            </div>

            {/* Chat */}
            <div className="glass-panel p-3 mt-1 flex justify-center">
              <ChatWidget
                chat={receivedChat}
                onSend={sendChat}
                disabled={isGameOver}
              />
            </div>
          </div>

          {/* ═══ RIGHT: OPPONENT'S TRAFFIC ═══ */}
          <div className="w-full lg:w-[38%]">
            <div className="glass-panel overflow-hidden" style={{ minHeight: '450px' }}>
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,51,102,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-red)' }} />
                  <span
                    className="text-xs uppercase tracking-widest font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)' }}
                  >
                    Opponent&apos;s Traffic
                  </span>
                </div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
                  {opponentHistory.length} attempts
                </span>
              </div>
              <div className="p-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
                <GuessHistory
                  history={opponentHistory.map(h => ({
                    guess: h.guess,
                    exact: h.exact,
                    numbers: h.numbers,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
