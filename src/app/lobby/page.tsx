'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import InputKeypad from '@/components/InputKeypad';
import RoomCode from '@/components/RoomCode';

export default function LobbyPage() {
  const router = useRouter();
  const {
    connectSocket, socket, hostRoom, joinRoom, lockSecret,
    roomCode, pvpStatus, players, isSecretLocked, lockedCount, errorMessage, clearError,
  } = useGameStore();

  const [joinInput, setJoinInput] = useState('');
  const [view, setView] = useState<'choice' | 'hosting' | 'joining'>('choice');

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  // Redirect to game when playing starts
  useEffect(() => {
    if (pvpStatus === 'playing') {
      router.push('/pvp');
    }
  }, [pvpStatus, router]);

  if (typeof window === 'undefined') return null;

  // ─── LOCKING SECRETS ───
  if (pvpStatus === 'locking' || (roomCode && players.length === 2 && pvpStatus !== 'playing')) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 pointer-events-none matrix-grid opacity-20" />
        <div className="relative z-10 w-full max-w-md text-center">
          <div
            className="mb-8"
          >
            <div className="text-4xl mb-4">🔒</div>
            <h2
              className="text-2xl font-black mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
            >
              SECURE YOUR CIPHER
            </h2>
            <p
              className="text-sm opacity-50"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', letterSpacing: '0.1em' }}
            >
              {isSecretLocked
                ? `WAITING FOR OPPONENT TO LOCK IN... (${lockedCount}/2)`
                : 'ENTER YOUR 4-DIGIT SECRET CODE (UNIQUE DIGITS)'}
            </p>
          </div>

          <div className={isSecretLocked ? 'opacity-30 pointer-events-none' : ''}>
            <InputKeypad onSubmit={lockSecret} disabled={isSecretLocked} label="LOCK IN" />
          </div>

          {isSecretLocked && (
            <div
              className="mt-6 flex items-center justify-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-cyan)' }} />
              <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                CIPHER LOCKED — SYNCHRONIZING...
              </span>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── WAITING FOR OPPONENT ───
  if (roomCode && players.length < 2) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="absolute inset-0 pointer-events-none matrix-grid opacity-20" />
        <div className="relative z-10 text-center">
          <div>
            <h2
              className="text-2xl font-black mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
            >
              ROOM ESTABLISHED
            </h2>
            <p
              className="text-sm opacity-50 mb-8"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', letterSpacing: '0.1em' }}
            >
              SHARE THIS CODE WITH YOUR OPPONENT
            </p>
          </div>

          <RoomCode code={roomCode} />

          <div
            className="mt-8 flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-cyan)' }} />
            <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
              WAITING FOR OPPONENT...
            </span>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-8 text-xs tracking-widest opacity-30 hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
          >
            CANCEL
          </button>
        </div>
      </main>
    );
  }

  // ─── LOBBY: HOST / JOIN ───
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 matrix-grid opacity-20" />
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} className="absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
            border: '1px solid rgba(74,85,104,0.2)',
            letterSpacing: '0.1em',
          }}
        >
          ← BACK
        </button>

        {/* Error banner */}
        {errorMessage && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-xs"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'rgba(255,51,102,0.1)',
                border: '1px solid rgba(255,51,102,0.3)',
                color: 'var(--accent-red)',
              }}
              onClick={clearError}
            >
              ⚠ {errorMessage}
            </div>
          )}
        {view === 'choice' && (
            <div
              key="choice"
              className="grid gap-4"
            >
              {/* HOST */}
              <button
                onClick={() => { setView('hosting'); hostRoom(); }}
                className="glass-panel p-8 text-center card-lift active:scale-95 transition-transform"
                style={{ borderColor: 'rgba(0,245,255,0.2)' }}
              >
                <div className="text-3xl mb-3">🏠</div>
                <h3
                  className="text-xl font-black mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
                >
                  HOST MATCH
                </h3>
                <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
                  Create a room and share the code
                </p>
              </button>

              {/* JOIN */}
              <button
                onClick={() => setView('joining')}
                className="glass-panel p-8 text-center card-lift active:scale-95 transition-transform"
                style={{ borderColor: 'rgba(0,255,136,0.2)' }}
              >
                <div className="text-3xl mb-3">🔗</div>
                <h3
                  className="text-xl font-black mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}
                >
                  JOIN MATCH
                </h3>
                <p className="text-xs opacity-40" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
                  Enter your friend&apos;s room code
                </p>
              </button>
            </div>
          )}

          {view === 'joining' && (
            <div
              key="joining"
              className="glass-panel p-8"
            >
              <button
                onClick={() => setView('choice')}
                className="text-xs opacity-40 hover:opacity-70 mb-6 block"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
              >
                ← Back
              </button>

              <h3
                className="text-xl font-black mb-6 text-center"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
              >
                ENTER ROOM CODE
              </h3>

              <input
                type="text"
                maxLength={5}
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="XXXXX"
                className="w-full text-center text-3xl font-black py-4 rounded-lg mb-4 outline-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'rgba(0,245,255,0.05)',
                  border: '1px solid rgba(0,245,255,0.2)',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.3em',
                  caretColor: 'var(--accent-cyan)',
                }}
              />

              <button
                disabled={joinInput.length !== 5 || !socket}
                onClick={() => joinRoom(joinInput)}
                className="btn-neon w-full text-sm disabled:opacity-30"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                CONNECT
              </button>
            </div>
          )}
        </div>
    </main>
  );
}
