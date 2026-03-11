'use client';

import { motion } from 'framer-motion';
import { GuessRecord } from '@/store/gameStore';

export default function GuessHistory({ history }: { history: GuessRecord[] }) {
  return (
    <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-3">
      {history.length === 0 && (
        <div className="text-center text-slate-500 font-mono mt-10">
          WAITING FOR INITIAL INPUT...
        </div>
      )}
      {history.map((record, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20, height: 0 }}
          animate={{ opacity: 1, x: 0, height: 'auto' }}
          className="glass-panel p-4 flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <span className="text-slate-500 font-mono">#{String(idx + 1).padStart(2, '0')}</span>
            <span className="text-2xl font-bold tracking-widest text-slate-100">{record.guess}</span>
          </div>
          <div className="flex flex-col items-end text-sm font-mono space-y-1">
            <span className="text-green-400">CORRECT DIGITS: {record.exact + record.numbers}</span>
            <span className="text-blue-400">EXACT POSITIONS: {record.exact}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
