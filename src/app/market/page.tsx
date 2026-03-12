'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

export default function MarketPage() {
  const router = useRouter();
  const { credits, removeCredits } = useGameStore();

  const items = [
    { id: 'avatar_glitch', name: 'GLITCH AVATAR', type: 'COSMETIC', price: 500, icon: '👾', description: 'Animated glitch effect for your profile picture.', rarity: 'RARE' },
    { id: 'cursor_trail', name: 'NEON TRAIL', type: 'UI UPGRADE', price: 1200, icon: '✨', description: 'Leaves a cyan trace behind your cursor.', rarity: 'EPIC' },
    { id: 'keypad_blood', name: 'BLOOD MOON KEYPAD', type: 'SKIN', price: 850, icon: '🩸', description: 'Changes keypad backlighting to crimson red.', rarity: 'UNCOMMON' },
    { id: 'boost_xp', name: 'XP BOOSTER', type: 'UTILITY', price: 300, icon: '🔋', description: 'Double ELO gain for the next 3 matches.', rarity: 'COMMON' },
    { id: 'sound_pack', name: 'SYSTEM OVERRIDE AUDIO', type: 'SOUND', price: 2000, icon: '🔊', description: 'Heavy mechanical thuds for inputs, siren for breach.', rarity: 'LEGENDARY' },
    { id: 'title_elite', name: 'ELITE TAG', type: 'BADGE', price: 5000, icon: '⭐', description: 'Exclusive ELITE badge next to your alias on leaderboard.', rarity: 'MYTHIC' },
  ];

  const handlePurchase = (item: typeof items[0]) => {
    if (credits >= item.price) {
      removeCredits(item.price);
      alert(`[TRANSACTION SECURE] ${item.name} acquired.`);
    } else {
      alert(`[ERROR] INSUFFICIENT SHARDS.`);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 px-6 pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,51,102,0.06) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div className="absolute inset-0 matrix-grid opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-dim)', border: '1px solid rgba(74,85,104,0.2)', letterSpacing: '0.1em' }}
          >
            ← BACK TO BASE
          </button>
          
          <div className="glass-panel px-6 py-2 flex items-center gap-3 border-amber-500/30">
            <span className="text-xl">💎</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-500/70 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>Data Shards</span>
              <span className="text-lg font-black text-amber-400" style={{ fontFamily: 'var(--font-display)' }}>{credits.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-glow-red" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)' }}>
            BLACK MARKET
          </h1>
          <p className="text-sm opacity-50 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}>
            UNREGISTERED CYBERWARES & ENHANCEMENTS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 flex flex-col card-lift relative overflow-hidden group"
              style={{
                borderColor: item.rarity === 'LEGENDARY' || item.rarity === 'MYTHIC' ? 'rgba(255,215,0,0.3)' : item.rarity === 'EPIC' ? 'rgba(186,85,211,0.3)' : item.rarity === 'RARE' ? 'rgba(0,245,255,0.3)' : 'rgba(74,85,104,0.2)'
              }}
            >
              {/* Rare Glow */}
              {(item.rarity === 'LEGENDARY' || item.rarity === 'MYTHIC') && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="text-4xl">{item.icon}</div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-black/50 tracking-widest" style={{ 
                    fontFamily: 'var(--font-display)', 
                    color: item.rarity === 'COMMON' ? 'var(--text-dim)' : item.rarity === 'UNCOMMON' ? 'var(--accent-green)' : item.rarity === 'RARE' ? 'var(--accent-cyan)' : item.rarity === 'EPIC' ? '#ba55d3' : '#ffd700'
                  }}>
                    {item.rarity}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-black mb-1 relative z-10" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {item.name}
              </h3>
              <p className="text-xs mb-3 tracking-widest uppercase relative z-10" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)' }}>
                [{item.type}]
              </p>
              
              <p className="text-sm mb-6 flex-grow relative z-10" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', opacity: 0.7 }}>
                {item.description}
              </p>

              <button
                onClick={() => handlePurchase(item)}
                disabled={credits < item.price}
                className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative z-10"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: credits >= item.price ? 'rgba(255,51,102,0.1)' : 'rgba(74,85,104,0.1)',
                  border: `1px solid ${credits >= item.price ? 'rgba(255,51,102,0.3)' : 'rgba(74,85,104,0.2)'}`,
                  color: credits >= item.price ? 'var(--accent-red)' : 'var(--text-dim)'
                }}
              >
                <span>{credits >= item.price ? 'ACQUIRE' : 'INSUFFICIENT FUNDS'}</span>
                {credits >= item.price && <span style={{ color: 'var(--accent-yellow)' }}>♦ {item.price}</span>}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
