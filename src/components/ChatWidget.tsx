'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
  chat: { message: string; timestamp: number } | null;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatWidget({ chat, onSend, disabled }: ChatWidgetProps) {
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = () => {
    if (inputMsg.trim()) {
      onSend(inputMsg.trim());
      setInputMsg('');
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="SEND COMM..."
          maxLength={40}
          disabled={disabled}
          className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'rgba(0,245,255,0.05)',
            border: '1px solid rgba(0,245,255,0.2)',
            color: 'var(--accent-cyan)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !inputMsg.trim()}
          className="text-xs px-3 py-2 rounded-lg transition-all border disabled:opacity-30 disabled:hover:bg-transparent"
          style={{ 
            fontFamily: 'var(--font-display)',
            borderColor: 'rgba(0,245,255,0.3)',
            color: 'var(--accent-cyan)',
            background: inputMsg.trim() ? 'rgba(0,245,255,0.1)' : 'transparent'
          }}
        >
          SEND
        </button>
      </div>

      <AnimatePresence>
        {chat && (
          <motion.div
            key={chat.timestamp}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-[30%] left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div 
              className="px-6 py-4 rounded-xl flex items-center gap-3"
              style={{
                background: 'rgba(0,10,20,0.85)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,245,255,0.4)',
                boxShadow: '0 0 30px rgba(0,245,255,0.25)'
              }}
            >
              <div className="text-2xl">💬</div>
              <p className="text-xl font-bold tracking-wider uppercase text-glow-cyan" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                 {chat.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
