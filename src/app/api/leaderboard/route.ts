import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        alias, elo, wins, games_played, 
        CASE WHEN games_played > 0 
          THEN ROUND((wins::numeric / games_played) * 100) 
          ELSE 0 
        END as win_rate,
        fastest_solve, country, is_guest
      FROM users
      ORDER BY elo DESC
      LIMIT 100
    `);

    const entries = result.rows.map((row, i) => ({
      rank: i + 1,
      alias: row.alias,
      elo: row.elo,
      wins: row.wins,
      games_played: row.games_played,
      win_rate: Number(row.win_rate),
      fastest_solve: row.fastest_solve,
      country: row.country,
      is_guest: row.is_guest,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.warn('[API] Leaderboard fetch failed:', (error as Error).message);
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alias, mode, result, guesses_taken, elo_change, is_guest } = body;

    if (!alias) {
      return NextResponse.json({ error: 'alias required' }, { status: 400 });
    }

    // Upsert user
    await pool.query(`
      INSERT INTO users (alias, is_guest, games_played, wins, losses, elo, avg_guesses, fastest_solve)
      VALUES ($1, $2, 1, 
        CASE WHEN $4 = 'win' THEN 1 ELSE 0 END,
        CASE WHEN $4 = 'loss' THEN 1 ELSE 0 END,
        1000 + COALESCE($6, 0),
        $5, 
        CASE WHEN $4 = 'win' THEN $5 ELSE 999 END
      )
      ON CONFLICT (alias) DO UPDATE SET
        games_played = users.games_played + 1,
        wins = users.wins + CASE WHEN $4 = 'win' THEN 1 ELSE 0 END,
        losses = users.losses + CASE WHEN $4 = 'loss' THEN 1 ELSE 0 END,
        elo = users.elo + COALESCE($6, 0),
        avg_guesses = ROUND(((users.avg_guesses * users.games_played + $5) / (users.games_played + 1))::numeric, 2),
        fastest_solve = LEAST(users.fastest_solve, CASE WHEN $4 = 'win' THEN $5 ELSE 999 END),
        current_streak = CASE WHEN $4 = 'win' THEN users.current_streak + 1 ELSE 0 END,
        best_streak = GREATEST(users.best_streak, CASE WHEN $4 = 'win' THEN users.current_streak + 1 ELSE users.best_streak END)
    `, [alias, is_guest || false, mode, result, guesses_taken || 0, elo_change || 0]);

    // Insert match record
    await pool.query(`
      INSERT INTO matches (player_id, mode, result, guesses_taken, elo_change)
      VALUES (
        (SELECT id FROM users WHERE alias = $1),
        $2, $3, $4, $5
      )
    `, [alias, mode, result, guesses_taken, elo_change || 0]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('[API] Leaderboard update failed:', (error as Error).message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
