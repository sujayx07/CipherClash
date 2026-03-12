'use client';

import { useEffect, useState } from 'react';

interface LossScreenProps {
  onContinue: () => void;
  reason?: string;
}

const letters = 'SYSTEM CRITICAL'.split('');

export default function LossScreen({ onContinue, reason }: LossScreenProps) {
  const [flashRed, setFlashRed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setFlashRed(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: flashRed ? 'rgba(255,20,20,0.3)' : 'rgba(20,5,10,0.95)' }}
      >
        {/* Red flash overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(255,51,102,0.2)' }}
        />

        {/* Glitch text */}
        <div className="flex gap-1 mb-6 relative">
          {letters.map((char, i) => (
            <span
              key={i}
              className="text-3xl md:text-5xl font-black"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--accent-red)',
                textShadow: '0 0 10px rgba(255,51,102,0.8), 0 0 20px rgba(255,51,102,0.4)',
                animation: `glitch 0.3s ease-in-out ${i * 0.1}s infinite`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p
          className="text-sm mb-8 uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--accent-red)',
            letterSpacing: '0.3em',
          }}
        >
          {reason === 'disconnect_timeout' ? 'OPPONENT DISCONNECTED — VICTORY BY DEFAULT' : 'YOUR CIPHER WAS BREACHED'}
        </p>

        {/* Warning lines */}
        <div
          className="mb-8 text-center"
        >
          {['ACCESS REVOKED', 'ENCRYPTION FAILED', 'SECURITY COMPROMISED'].map((line, i) => (
            <p
              key={i}
              className="text-xs"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)', letterSpacing: '0.2em' }}
            >
              [{line}]
            </p>
          ))}
        </div>

        {/* Continue */}
        <button
          onClick={onContinue}
          className="btn-neon"
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.2em',
            borderColor: 'var(--accent-red)',
            color: 'var(--accent-red)',
          }}
        >
          RETURN TO BASE
        </button>
      </div>
    );
}
