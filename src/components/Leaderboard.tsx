'use client';

import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  alias: string;
  elo: number;
  wins: number;
  games_played: number;
  win_rate: number;
  fastest_solve: number;
  country?: string;
  is_guest: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  compact?: boolean; // For landing page preview
}

export default function Leaderboard({ entries, loading, compact }: LeaderboardProps) {
  const [tab, setTab] = useState<'alltime' | 'weekly'>('alltime');

  const displayEntries = compact ? entries.slice(0, 5) : entries;

  return (
    <div className="w-full">
      {/* Tabs */}
      {!compact && (
        <div className="flex gap-2 mb-4">
          {(['alltime', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                background: tab === t ? 'rgba(0,245,255,0.1)' : 'transparent',
                border: `1px solid ${tab === t ? 'var(--accent-cyan)' : 'rgba(74,85,104,0.2)'}`,
                color: tab === t ? 'var(--accent-cyan)' : 'var(--text-dim)',
              }}
            >
              {t === 'alltime' ? 'All Time' : 'This Week'}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <div
          className="grid gap-2 px-4 py-3 text-xs uppercase tracking-wider opacity-50"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-dim)',
            gridTemplateColumns: compact ? '40px 1fr 70px' : '50px 1fr 60px 60px 70px 80px',
            borderBottom: '1px solid rgba(0,245,255,0.1)',
          }}
        >
          <span>#</span>
          <span>Player</span>
          <span className="text-right">ELO</span>
          {!compact && (
            <>
              <span className="text-right">Wins</span>
              <span className="text-right">Win%</span>
              <span className="text-right">Best</span>
            </>
          )}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-8 text-center opacity-40" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
            LOADING...
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="py-8 text-center opacity-40" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
            NO DATA AVAILABLE
          </div>
        ) : (
          displayEntries.map((entry, i) => (
            <div
              key={entry.alias}
              className="grid gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
              style={{
                gridTemplateColumns: compact ? '40px 1fr 70px' : '50px 1fr 60px 60px 70px 80px',
                borderBottom: '1px solid rgba(0,245,255,0.05)',
              }}
            >
              {/* Rank */}
              <span
                className="text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: entry.rank <= 3
                    ? entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : '#cd7f32'
                    : 'var(--text-dim)',
                }}
              >
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </span>

              {/* Player */}
              <div className="flex items-center gap-2 min-w-0">
                {entry.country && <span className="text-sm">{entry.country}</span>}
                <span
                  className="truncate text-sm"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: entry.is_guest ? 'var(--text-dim)' : 'var(--text-primary)',
                  }}
                >
                  {entry.alias}
                </span>
              </div>

              {/* ELO */}
              <span
                className="text-right text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--accent-cyan)',
                }}
              >
                {entry.elo}
              </span>

              {!compact && (
                <>
                  <span className="text-right text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {entry.wins}
                  </span>
                  <span className="text-right text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>
                    {entry.win_rate}%
                  </span>
                  <span className="text-right text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-yellow)' }}>
                    {entry.fastest_solve < 999 ? `${entry.fastest_solve} tries` : '-'}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
