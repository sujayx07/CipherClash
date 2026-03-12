'use client';

import { useEffect, useState } from 'react';

interface WinScreenProps {
  guessCount: number;
  onContinue: () => void;
}

const letters = 'SYSTEM BREACHED'.split('');

export default function WinScreen({ guessCount, onContinue }: WinScreenProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: 'rgba(0,15,10,0.95)' }}
      >
        {/* Particle burst */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 3 === 0 ? 'var(--accent-green)' : i % 3 === 1 ? 'var(--accent-cyan)' : 'var(--accent-yellow)',
                  boxShadow: `0 0 10px currentColor`,
                }}
              />
            ))}
          </div>
        )}

        {/* Main text */}
        <div className="flex gap-1 mb-6">
          {letters.map((char, i) => (
            <span
              key={i}
              className="text-3xl md:text-5xl font-black text-glow-green"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--accent-green)',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div
          className="text-center"
        >
          <p
            className="text-lg mb-1 opacity-70"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            CODE CRACKED IN
          </p>
          <p
            className="text-5xl font-black mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-cyan)',
              textShadow: '0 0 20px rgba(0,245,255,0.6)',
            }}
          >
            {guessCount}
          </p>
          <p
            className="text-sm opacity-50 mb-8"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {guessCount <= 3 ? 'ELITE HACKER' : guessCount <= 6 ? 'SKILLED OPERATIVE' : guessCount <= 10 ? 'COMPETENT AGENT' : 'ROOKIE'}
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="btn-neon-green btn-neon"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}
        >
          RETURN TO BASE
        </button>
      </div>
    );
}
