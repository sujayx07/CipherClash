'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGameStore } from '@/store/gameStore';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isLoggedIn, userName, guestAlias, credits } = useGameStore();
  
  const displayName = session?.user?.name || (isLoggedIn ? userName : guestAlias);

  // Mock stats
  const stats = {
    rank: 42,
    elo: 1340,
    winRate: 68,
    totalGames: 142,
    fastestSolve: 4,
    favoriteMode: 'PvP',
  };

  const loadout = [
    { type: 'AVATAR', name: 'DEFAULT GHOST', icon: '👻', rarity: 'COMMON' },
    { type: 'KEYPAD', name: 'NEON MATRIX', icon: '⌨️', rarity: 'RARE' },
    { type: 'BADGE', name: 'EARLY ADOPTER', icon: '🎖️', rarity: 'EPIC' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 px-6 pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div className="absolute inset-0 matrix-grid opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-dim)', border: '1px solid rgba(74,85,104,0.2)', letterSpacing: '0.1em' }}
          >
            ← BACK TO BASE
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/market')}
              className="px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest hover:bg-amber-500/10"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-yellow)', border: '1px solid var(--accent-yellow)' }}
            >
              🛒 BLACK MARKET
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Identity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 flex flex-col justify-center items-center text-center">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full mb-6 object-cover" 
                style={{ border: '2px solid var(--accent-cyan)', boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full mb-6 flex items-center justify-center text-6xl relative" style={{ background: 'rgba(0,245,255,0.05)', border: '2px solid var(--accent-cyan)' }}>
                👻
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-2 border-black" />
              </div>
            )}
            <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {displayName}
            </h2>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
              {session ? 'Neural Link Operative' : (isLoggedIn ? 'Cyber Operative' : 'Unregistered Ghost')}
            </p>
            
            <div className="w-full mt-4 p-3 rounded bg-black/30 border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Data Shards</span>
              <span className="text-lg font-bold text-amber-400" style={{ fontFamily: 'var(--font-display)' }}>♦ {credits.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass-panel p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-cyan-500/20">
              <h3 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>COMBAT RECORD</h3>
              <div className="flex items-center gap-2">
                <span className="text-4xl">🏆</span>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Global Rank</span>
                  <span className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>#{stats.rank}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Current ELO', value: stats.elo, color: 'var(--accent-cyan)' },
                { label: 'Win Rate', value: `${stats.winRate}%`, color: 'var(--accent-green)' },
                { label: 'Total Operations', value: stats.totalGames, color: 'var(--text-primary)' },
                { label: 'Fastest Breach', value: `${stats.fastestSolve} Turns`, color: 'var(--accent-yellow)' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-display)' }}>{stat.label}</span>
                  <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Loadout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider text-center md:text-left" style={{ fontFamily: 'var(--font-display)' }}>
            CURRENT LOADOUT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadout.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-slate-800">
                <div className="w-12 h-12 flex items-center justify-center text-2xl rounded-lg bg-slate-800 shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded w-max" style={{ 
                    fontFamily: 'var(--font-display)', 
                    background: item.rarity === 'COMMON' ? 'rgba(160,174,192,0.1)' : item.rarity === 'RARE' ? 'rgba(0,245,255,0.1)' : 'rgba(186,85,211,0.1)',
                    color: item.rarity === 'COMMON' ? 'var(--text-dim)' : item.rarity === 'RARE' ? 'var(--accent-cyan)' : '#ba55d3'
                  }}>
                    {item.rarity}
                  </span>
                  <span className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>{item.name}</span>
                  <span className="text-xs text-slate-500 font-mono mt-0.5">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
