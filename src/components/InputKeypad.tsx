'use client';

import { useState, useCallback } from 'react';

interface InputKeypadProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function InputKeypad({ onSubmit, disabled = false, label = 'SUBMIT' }: InputKeypadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const usedDigits = new Set(digits);

  const handleDigit = useCallback((d: string) => {
    if (disabled) return;
    if (digits.length >= 4) return;
    if (usedDigits.has(d)) return;
    setDigits(prev => [...prev, d]);
    setError(null);
  }, [disabled, digits, usedDigits]);

  const handleDelete = useCallback(() => {
    if (disabled) return;
    setDigits(prev => prev.slice(0, -1));
    setError(null);
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled || digits.length !== 4) return;
    onSubmit(digits.join(''));
    setDigits([]);
    setError(null);
  }, [disabled, digits, onSubmit]);

  const isReady = digits.length === 4;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DEL', label];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Input Slots */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`digit-cell ${digits[i] ? '' : 'empty'}`}
          >
            {digits[i] ? (
                <span
                  key={digits[i]}
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
                >
                  {digits[i]}
                </span>
              ) : (
                <span
                  key="placeholder"
                  style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}
                >
                  _
                </span>
              )}
            </div>
        ))}
      </div>

      {/* Error */}
      {error && (
          <div
            className="text-xs tracking-wider"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)' }}
          >
            ⚠ {error}
          </div>
        )}
      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
        {keys.map((key) => {
          const isDigitKey = /^\d$/.test(key);
          const isDimmed = isDigitKey && usedDigits.has(key);
          const isDelete = key === 'DEL';
          const isSubmit = key === label;

          return (
            <button
              key={key}
              disabled={disabled || (isDigitKey && isDimmed) || (isSubmit && !isReady)}
              onClick={() => {
                if (isDelete) handleDelete();
                else if (isSubmit) handleSubmit();
                else handleDigit(key);
              }}
              className="h-14 rounded-lg font-semibold text-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'var(--font-display)',
                background: isSubmit
                  ? isReady
                    ? 'rgba(0,255,136,0.15)'
                    : 'rgba(30,30,50,0.5)'
                  : isDelete
                    ? 'rgba(255,51,102,0.1)'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  isSubmit && isReady
                    ? 'var(--accent-green)'
                    : isDelete
                      ? 'rgba(255,51,102,0.3)'
                      : isDimmed
                        ? 'rgba(74,85,104,0.2)'
                        : 'rgba(0,245,255,0.15)'
                }`,
                color: isSubmit && isReady
                  ? 'var(--accent-green)'
                  : isDelete
                    ? 'var(--accent-red)'
                    : isDimmed
                      ? 'var(--text-dim)'
                      : 'var(--text-primary)',
                boxShadow: isSubmit && isReady
                  ? '0 0 15px rgba(0,255,136,0.2)'
                  : 'none',
                letterSpacing: '0.05em',
              }}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
