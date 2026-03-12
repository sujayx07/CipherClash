'use client';

import { useState } from 'react';

interface RoomCodeProps {
  code: string;
}

export default function RoomCode({ code }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="text-xs uppercase tracking-widest opacity-50"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
      >
        Secure Room Code
      </p>
      
      <div className="flex gap-2">
        {code.split('').map((char, i) => (
          <div
            key={i}
            className="w-14 h-16 flex items-center justify-center rounded-lg text-2xl font-black neon-border-cyan"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--accent-cyan)',
              background: 'rgba(0,245,255,0.05)',
              textShadow: '0 0 10px rgba(0,245,255,0.6)',
            }}
          >
            {char}
          </div>
        ))}
      </div>

      <button
        onClick={handleCopy}
        className="text-xs px-4 py-2 rounded-lg transition-all"
        style={{
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.1em',
          background: copied ? 'rgba(0,255,136,0.1)' : 'rgba(0,245,255,0.08)',
          border: `1px solid ${copied ? 'var(--accent-green)' : 'rgba(0,245,255,0.2)'}`,
          color: copied ? 'var(--accent-green)' : 'var(--accent-cyan)',
        }}
      >
        {copied ? '✓ COPIED' : '📋 COPY CODE'}
      </button>
    </div>
  );
}
