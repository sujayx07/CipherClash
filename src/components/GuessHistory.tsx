'use client';


export interface GuessEntry {
  guess: string;
  exact: number;
  numbers: number;
}

interface GuessHistoryProps {
  history: GuessEntry[];
  label?: string;
  accentColor?: string;
}

export default function GuessHistory({ history, label, accentColor = 'var(--accent-cyan)' }: GuessHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 opacity-40">
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}>
          NO ATTEMPTS LOGGED
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((entry, idx) => (
        <div
          key={idx}
          className="glass-panel px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span
              className="opacity-40 text-xs w-6"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dim)' }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="flex gap-1.5">
              {entry.guess.split('').map((digit, dIdx) => (
                <div
                  key={dIdx}
                  className="digit-cell"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>

          {/* Result badges: EXACT positions + correct NUMBERS */}
          <div className="flex gap-2">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                background: entry.exact > 0 ? 'rgba(0,255,136,0.12)' : 'rgba(74,85,104,0.15)',
                color: entry.exact > 0 ? 'var(--accent-green)' : 'var(--text-dim)',
                border: `1px solid ${entry.exact > 0 ? 'rgba(0,255,136,0.3)' : 'rgba(74,85,104,0.2)'}`,
              }}
            >
              {entry.exact} POS
            </span>
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                background: entry.numbers > 0 ? 'rgba(255,215,0,0.12)' : 'rgba(74,85,104,0.15)',
                color: entry.numbers > 0 ? 'var(--accent-yellow)' : 'var(--text-dim)',
                border: `1px solid ${entry.numbers > 0 ? 'rgba(255,215,0,0.3)' : 'rgba(74,85,104,0.2)'}`,
              }}
            >
              {entry.numbers} NUM
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
