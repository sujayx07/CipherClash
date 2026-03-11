'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { isValidGuess } from '@/lib/gameLogic';

interface InputKeypadProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
}

export default function InputKeypad({ onSubmit, disabled = false }: InputKeypadProps) {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInput = (digit: string) => {
    if (disabled) return;
    if (guess.length < 4) {
      const newGuess = guess + digit;
      setGuess(newGuess);
      validate(newGuess);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    const newGuess = guess.slice(0, -1);
    setGuess(newGuess);
    validate(newGuess);
  };

  const validate = (val: string) => {
    if (val.length > 0) {
      const unique = new Set(val);
      if (unique.size !== val.length) {
        setError('DUPLICATE DIGIT DETECTED (MUST BE UNIQUE)');
        return;
      }
    }
    setError(null);
  };

  const handleSubmit = () => {
    if (disabled) return;
    if (guess.length !== 4) {
      setError('INPUT MUST BE EXACTLY 4 DIGITS');
      return;
    }
    if (!isValidGuess(guess)) {
      setError('INVALID INPUT');
      return;
    }
    onSubmit(guess);
    setGuess('');
    setError(null);
  };

  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <div className="h-6 mb-2 text-red-500 text-xs font-mono font-bold flex items-center space-x-2">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </div>

      <div className="flex space-x-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-14 h-16 rounded-md flex items-center justify-center text-3xl font-bold bg-slate-950 border ${guess[i] ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] text-white' : 'border-slate-800 text-slate-600'}`}>
            {guess[i] || '_'}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 w-full px-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((btn) => (
          <button
            key={btn}
            disabled={disabled}
            onClick={() => {
              if (btn === 'CLR') setGuess('');
              else if (btn === 'DEL') handleBackspace();
              else handleInput(btn);
            }}
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded disabled:opacity-50 text-slate-100 font-mono font-bold transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>

      <button
        disabled={disabled || guess.length !== 4 || !!error}
        onClick={handleSubmit}
        className="w-full py-4 rounded-lg bg-neon-blue text-white font-bold font-mono tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 neon-border-blue transition-all"
        style={{
          boxShadow: (disabled || guess.length !== 4 || !!error) ? 'none' : '0 0 15px rgba(19, 91, 236, 0.4)'
        }}
      >
        SUBMIT GUESS
      </button>
    </div>
  );
}
