'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useGameStore } from '@/store/gameStore';
import HowToPlayDemo from '@/components/HowToPlayDemo';

export default function LandingPage() {
  const router = useRouter();
  const { guestAlias, isLoggedIn, userName, setUser } = useGameStore();
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cc_user_name');
    void signOut({ callbackUrl: '/' });
  }, [setUser]);

  // Persist legacy local alias login if present.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('cc_user_name');
      if (savedName) setUser(savedName);
    }
  }, [setUser]);

  // Keep store auth state aligned with NextAuth session.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const name = session.user?.name?.trim();
    if (name) {
      setUser(name);
    }
  }, [session, setUser, status]);

  // Merge guest progress into authenticated account once session is active.
  useEffect(() => {
    if (status !== 'authenticated') return;
    void fetch('/api/session/upgrade', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Silent fail keeps gameplay available even if DB is unavailable.
    });
  }, [status]);

  // Ensure server-side signed guest cookie is initialized for guest sessions.
  useEffect(() => {
    if (status === 'authenticated') return;
    void fetch('/api/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'x-cc-guest-alias': guestAlias,
      },
    }).catch(() => {
      // Guest mode should still work even if cookie setup fails.
    });
  }, [guestAlias, status]);

  if (typeof window === 'undefined') return null;

  const sessionName = session?.user?.name?.trim();
  const displayName = sessionName || (isLoggedIn ? userName : guestAlias);
  const authenticated = status === 'authenticated';

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ─── BG EFFECTS ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 matrix-grid opacity-40" />
        <div className="absolute inset-0 scanline-overlay" />
      </div>

      {/* ─── TOP BAR ─── */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <span className="text-xs tracking-widest opacity-50" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
          v1.0
        </span>
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/profile')}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: authenticated ? 'var(--accent-green)' : 'var(--accent-yellow)' }} />
            <span className="text-xs" style={{ fontFamily: 'var(--font-display)', color: authenticated ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
              {authenticated ? displayName : `Ghost: ${displayName}`}
            </span>
          </div>
          <button
            onClick={() => router.push('/market')}
            className="text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-all"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-yellow)', border: '1px solid rgba(255,215,0,0.2)' }}
          >
            MARKET
          </button>
          {authenticated || isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-all"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', border: '1px solid rgba(74,85,104,0.2)' }}
            >
              LOGOUT
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs px-3 py-1 rounded-lg hover:bg-white/5 transition-all"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,245,255,0.2)' }}
            >
              LOGIN
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ AUTH MODAL ═══════════════ */}
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,10,20,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel p-8 w-full max-w-sm"
          >
            <h3
              className="text-xl font-black mb-6 text-center"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
            >
              CONNECT YOUR ACCOUNT
            </h3>

            <button
              onClick={() => {
                void signIn('github');
              }}
              className="btn-neon w-full text-sm mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              GITHUB LOGIN
            </button>

            <button
              onClick={() => {
                void signIn('google');
              }}
              className="btn-neon w-full text-sm"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              GOOGLE LOGIN
            </button>

            <p
              className="text-center text-xs mt-4 opacity-40"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
            >
              Or continue as <span style={{ color: 'var(--accent-yellow)' }}>{guestAlias}</span>
            </p>

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full text-xs mt-2 py-2 opacity-40 hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
            >
              CONTINUE AS GUEST
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <h1
            className="glitch-text text-5xl md:text-7xl lg:text-8xl font-black mb-4 text-glow-cyan tracking-tight"
            data-text="CIPHERCLASH"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
          >
            {'CIPHERCLASH'.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
              >
                {char}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-sm md:text-base uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
          >
            {'CRACK THE CODE. OUTTHINK YOUR OPPONENT.'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="inline-block mr-2"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/pve')}
            className="px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-[0.2em] transition-all animate-neon-pulse"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'transparent',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
            }}
          >
            ⚡ Play Solo
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/lobby')}
            className="px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-[0.2em] transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'transparent',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              boxShadow: '0 0 15px rgba(0,245,255,0.2)',
            }}
          >
            🎯 Challenge a Friend
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3, y: [0, 8, 0] }}
          transition={{ delay: 2.5, y: { duration: 1.5, repeat: Infinity } }}
          className="absolute bottom-8"
        >
          <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
            SCROLL TO LEARN ↓
          </span>
        </motion.div>
      </section>

      {/* ═══════════════ HOW TO PLAY ═══════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
              HOW IT WORKS
            </h2>
            <p className="text-sm opacity-50" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
              WATCH THE DEMO — NO READING REQUIRED
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="glass-panel p-6 md:p-8"
          >
            <HowToPlayDemo />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ GAME MODES ═══════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-center mb-12"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
          >
            CHOOSE YOUR MODE
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PvE Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              onClick={() => router.push('/pve')}
              className="glass-panel p-8 cursor-pointer card-lift group"
              style={{ borderColor: 'rgba(0,255,136,0.2)' }}
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-black mb-2 group-hover:text-glow-green transition-all" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>
                PvE — SOLO MISSION
              </h3>
              <p className="text-sm opacity-60 mb-4" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                Crack the AI&apos;s randomly generated 4-digit code. No turn limit — just you versus the machine.
              </p>
              <div className="flex flex-wrap gap-2">
                {['AI Opponent', 'Score Tracking', 'Unlimited Attempts'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'rgba(0,255,136,0.08)',
                      border: '1px solid rgba(0,255,136,0.2)',
                      color: 'var(--accent-green)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* PvP Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              onClick={() => router.push('/lobby')}
              className="glass-panel p-8 cursor-pointer card-lift group"
              style={{ borderColor: 'rgba(0,245,255,0.2)' }}
            >
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-black mb-2 group-hover:text-glow-cyan transition-all" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                PvP — MULTIPLAYER DUEL
              </h3>
              <p className="text-sm opacity-60 mb-4" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                Challenge a friend in real-time. Both set codes, take turns guessing. First to crack wins.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Real-Time', 'Room Codes', 'Turn-Based'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'rgba(0,245,255,0.08)',
                      border: '1px solid rgba(0,245,255,0.2)',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ LEADERBOARD PREVIEW ═══════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-center mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
          >
            LEADERBOARD
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-center text-sm mb-8"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', letterSpacing: '0.1em' }}
          >
            TOP OPERATIVES THIS SEASON
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <LeaderboardPreview />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-6">
            <button
              onClick={() => router.push('/leaderboard')}
              className="btn-neon text-xs"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              VIEW FULL RANKINGS →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 py-8 px-6 border-t" style={{ borderColor: 'rgba(0,245,255,0.08)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-30" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
            CIPHERCLASH © 2025
          </p>
        </div>
      </footer>
    </main>
  );
}

function LeaderboardPreview() {
  const mockData = [
    { rank: 1, alias: 'cipher_wolf', elo: 1340, is_guest: false },
    { rank: 2, alias: 'phantom_0xA3', elo: 1285, is_guest: true },
    { rank: 3, alias: 'hex_shadow', elo: 1260, is_guest: false },
    { rank: 4, alias: 'null_byte', elo: 1210, is_guest: true },
    { rank: 5, alias: 'binary_ghost', elo: 1180, is_guest: false },
  ];

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="grid gap-2 px-4 py-3 text-xs uppercase tracking-wider opacity-40"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)', gridTemplateColumns: '40px 1fr 70px', borderBottom: '1px solid rgba(0,245,255,0.1)' }}
      >
        <span>#</span>
        <span>Player</span>
        <span className="text-right">ELO</span>
      </div>
      {mockData.map((entry, i) => (
        <motion.div
          key={entry.alias}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="grid gap-2 px-4 py-3 items-center"
          style={{ gridTemplateColumns: '40px 1fr 70px', borderBottom: '1px solid rgba(0,245,255,0.05)' }}
        >
          <span
            className="text-sm font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-dim)',
            }}
          >
            {i <= 2 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
          </span>
          <span className="text-sm" style={{ fontFamily: 'var(--font-display)', color: entry.is_guest ? 'var(--text-dim)' : 'var(--text-primary)' }}>
            {entry.alias}
          </span>
          <span className="text-right text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
            {entry.elo}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
