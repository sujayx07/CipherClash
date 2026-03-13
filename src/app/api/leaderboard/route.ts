import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { buildGuestCookie, GUEST_COOKIE_NAME, sanitizeAlias, verifySignedAlias } from '@/lib/identity';
import { computeScoreDelta, MatchMode, MatchResult } from '@/lib/scoring';

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
    const session = await getServerSession(authOptions);
    const headerStore = await headers();
    const cookieStore = await cookies();

    const body = await request.json();
    const { mode, result, guesses_taken } = body as {
      mode?: MatchMode;
      result?: MatchResult;
      guesses_taken?: number;
    };

    if (!mode || !result || !['pve', 'pvp'].includes(mode) || !['win', 'loss'].includes(result)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const sessionEmail = session?.user?.email?.toLowerCase() || null;
    const sessionAlias = sanitizeAlias(
      session?.user?.name || sessionEmail?.split('@')[0] || 'operative',
    );

    const cookieAlias = verifySignedAlias(cookieStore.get(GUEST_COOKIE_NAME)?.value);
    const headerGuestAlias = headerStore.get('x-cc-guest-alias');
    const resolvedGuestAlias = sanitizeAlias(headerGuestAlias || cookieAlias || 'guest');

    const identity = sessionEmail
      ? { alias: sessionAlias, email: sessionEmail, isGuest: false }
      : { alias: resolvedGuestAlias, email: null as string | null, isGuest: true };

    const currentResult = await pool.query(
      `SELECT games_played, current_streak FROM users WHERE alias = $1`,
      [identity.alias],
    );

    const existing = currentResult.rows[0] || { games_played: 0, current_streak: 0 };
    const scoreDelta = computeScoreDelta({
      mode,
      result,
      guessesTaken: Math.max(1, Number(guesses_taken || 0)),
      gamesPlayedBefore: Number(existing.games_played || 0),
      currentStreakBefore: Number(existing.current_streak || 0),
    });

    // Upsert user
    await pool.query(`
      INSERT INTO users (alias, email, is_guest, games_played, wins, losses, elo, avg_guesses, fastest_solve)
      VALUES ($1, $2, $3, 1, 
        CASE WHEN $4 = 'win' THEN 1 ELSE 0 END,
        CASE WHEN $4 = 'loss' THEN 1 ELSE 0 END,
        1000 + $6,
        $5, 
        CASE WHEN $4 = 'win' THEN $5 ELSE 999 END
      )
      ON CONFLICT (alias) DO UPDATE SET
        email = COALESCE(users.email, EXCLUDED.email),
        is_guest = EXCLUDED.is_guest,
        games_played = users.games_played + 1,
        wins = users.wins + CASE WHEN $4 = 'win' THEN 1 ELSE 0 END,
        losses = users.losses + CASE WHEN $4 = 'loss' THEN 1 ELSE 0 END,
        elo = users.elo + $6,
        avg_guesses = ROUND(((users.avg_guesses * users.games_played + $5) / (users.games_played + 1))::numeric, 2),
        fastest_solve = LEAST(users.fastest_solve, CASE WHEN $4 = 'win' THEN $5 ELSE 999 END),
        current_streak = CASE WHEN $4 = 'win' THEN users.current_streak + 1 ELSE 0 END,
        best_streak = GREATEST(users.best_streak, CASE WHEN $4 = 'win' THEN users.current_streak + 1 ELSE users.best_streak END)
    `, [identity.alias, identity.email, identity.isGuest, result, Math.max(1, Number(guesses_taken || 0)), scoreDelta]);

    // Insert match record
    await pool.query(`
      INSERT INTO matches (player_id, mode, result, guesses_taken, elo_change)
      VALUES (
        (SELECT id FROM users WHERE alias = $1),
        $2, $3, $4, $5
      )
    `, [identity.alias, mode, result, Math.max(1, Number(guesses_taken || 0)), scoreDelta]);

    const response = NextResponse.json({ success: true, scoreDelta });
    if (!sessionEmail) {
      response.cookies.set(buildGuestCookie(identity.alias));
    }

    return response;
  } catch (error) {
    console.warn('[API] Leaderboard update failed:', (error as Error).message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
