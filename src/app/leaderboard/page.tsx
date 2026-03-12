'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import Leaderboard from '@/components/Leaderboard';

interface LeaderboardEntry {
  rank: number;
  alias: string;
  elo: number;
  wins: number;
  games_played: number;
  win_rate: number;
  fastest_solve: number;
  country?: string;
  is_guest: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch {
        // Use fallback data
        setEntries(generateMockData());
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.04) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div className="absolute inset-0 matrix-grid opacity-20" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
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
            ← BACK
          </button>

          {/* Neural Link Auth Module */}
          <div className="glass-panel p-4 flex flex-col items-center border border-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.1)] rounded-xl min-w-[240px]">
            <h3 className="text-xs uppercase tracking-widest text-cyan-400 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Neural Link Status</h3>
            
            {status === 'loading' ? (
              <div className="text-xs text-slate-500 animate-pulse">ESTABLISHING CONNECTION...</div>
            ) : session ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-center gap-3 w-full p-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  {session.user?.image && (
                    <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-cyan-500/50" />
                  )}
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-bold text-slate-200 truncate">{session.user?.name}</span>
                    <span className="text-[10px] text-green-400 font-mono">CONNECTION SECURE</span>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-[10px] uppercase tracking-widest text-slate-400 hover:text-red-400 mt-2 transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  [ SEVER CONNECTION ]
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={() => signIn('github')}
                  className="w-full btn-neon py-2 text-xs flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub Login
                </button>
                <button
                  onClick={() => signIn('google')}
                  className="w-full btn-neon py-2 text-xs flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-black mb-2 text-glow-cyan"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
          >
            LEADERBOARD
          </h1>
          <p
            className="text-sm opacity-40"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', letterSpacing: '0.15em' }}
          >
            GLOBAL RANKINGS — TOP 100 OPERATIVES
          </p>
        </div>

        {/* Leaderboard */}
        <div>
          <Leaderboard entries={entries} loading={loading} />
        </div>
      </div>
    </main>
  );
}

function generateMockData(): LeaderboardEntry[] {
  const names = [
    'cipher_wolf', 'phantom_0xA3', 'hex_shadow', 'null_byte', 'binary_ghost',
    'code_wraith', 'data_phantom', 'neo_breaker', 'sys_override', 'dark_cipher',
    'quantum_hack', 'void_runner', 'pixel_storm', 'byte_hunter', 'zero_day',
  ];
  
  return names.map((alias, i) => ({
    rank: i + 1,
    alias,
    elo: 1400 - i * 15 + Math.floor(Math.random() * 20),
    wins: 50 - i * 2 + Math.floor(Math.random() * 10),
    games_played: 80 - i * 2 + Math.floor(Math.random() * 10),
    win_rate: Math.round((50 - i * 2) / (80 - i * 2) * 100),
    fastest_solve: 3 + Math.floor(Math.random() * 5),
    is_guest: i % 3 === 0,
  }));
}
