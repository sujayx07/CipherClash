'use client';


interface EmojiReactProps {
  emoji: { emoji: string; timestamp: number } | null;
  onSend: (emoji: string) => void;
  disabled?: boolean;
}

const emojis = ['😤', '🔥', '💀', '😂', '🧠', '⚡'];

export default function EmojiReact({ emoji, onSend, disabled }: EmojiReactProps) {
  return (
    <>
      {/* Send buttons */}
      <div className="flex gap-2">
        {emojis.map((e) => (
          <button
            key={e}
            disabled={disabled}
            onClick={() => onSend(e)}
            className="text-xl p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            {e}
          </button>
        ))}
      </div>

      {/* Received emoji overlay */}
      {emoji && (
          <div
            key={emoji.timestamp}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 text-6xl pointer-events-none"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
          >
            {emoji.emoji}
          </div>
        )}
      </>
  );
}
