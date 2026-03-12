'use client';


interface OpponentFeedProps {
  opponentGuessCount: number;
  isMyTurn: boolean;
  opponentDisconnected: boolean;
  gracePeriodMs: number;
}

export default function OpponentFeed({ opponentGuessCount, isMyTurn, opponentDisconnected, gracePeriodMs }: OpponentFeedProps) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-xs uppercase tracking-widest opacity-70"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}
        >
          Intel Feed
        </h3>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${opponentDisconnected ? 'disconnected' : 'connected'}`} />
          <span
            className="text-xs"
            style={{
              fontFamily: 'var(--font-display)',
              color: opponentDisconnected ? 'var(--accent-red)' : 'var(--accent-green)',
            }}
          >
            {opponentDisconnected ? 'OFFLINE' : 'ONLINE'}
          </span>
        </div>
      </div>

      {/* Disconnect warning */}
      {opponentDisconnected && (
          <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'rgba(255,51,102,0.1)',
              border: '1px solid rgba(255,51,102,0.3)',
              color: 'var(--accent-red)',
            }}
          >
            ⚠ Opponent disconnected. Waiting {Math.ceil(gracePeriodMs / 1000)}s for reconnect...
          </div>
        )}
      {/* Opponent guess count */}
      <div className="text-center py-4">
        <p
          className="text-xs uppercase tracking-widest opacity-50 mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
        >
          Opponent Attempts
        </p>
        <p
          key={opponentGuessCount}
          className="text-4xl font-black"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {opponentGuessCount}
        </p>
      </div>

      {/* Turn indicator */}
      <div
        className="text-center py-3 rounded-lg transition-all duration-500"
        style={{
          background: isMyTurn ? 'rgba(0,245,255,0.08)' : 'rgba(74,85,104,0.1)',
          border: `1px solid ${isMyTurn ? 'rgba(0,245,255,0.3)' : 'rgba(74,85,104,0.2)'}`,
        }}
      >
        <p
          className="text-sm font-bold uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-display)',
            color: isMyTurn ? 'var(--accent-cyan)' : 'var(--text-dim)',
            textShadow: isMyTurn ? '0 0 10px rgba(0,245,255,0.5)' : 'none',
          }}
        >
          {isMyTurn ? '⚡ YOUR TURN' : '⏳ WAITING...'}
        </p>
      </div>
    </div>
  );
}
