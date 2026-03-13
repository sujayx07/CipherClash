import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { GUEST_COOKIE_NAME, sanitizeAlias, verifySignedAlias } from '@/lib/identity';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const headerStore = await headers();

    const sessionEmail = session?.user?.email?.toLowerCase() || null;
    const sessionAlias = sanitizeAlias(
      session?.user?.name || sessionEmail?.split('@')[0] || 'operative',
    );

    const cookieAlias = verifySignedAlias(cookieStore.get(GUEST_COOKIE_NAME)?.value);
    const headerGuestAlias = headerStore.get('x-cc-guest-alias');
    const guestAlias = sanitizeAlias(headerGuestAlias || cookieAlias || 'guest');

    const identity = sessionEmail
      ? { alias: sessionAlias, email: sessionEmail, isGuest: false }
      : { alias: guestAlias, email: null as string | null, isGuest: true };

    await pool.query(
      `
      INSERT INTO users (alias, email, is_guest)
      VALUES ($1, $2, $3)
      ON CONFLICT (alias) DO UPDATE SET
        email = COALESCE(users.email, EXCLUDED.email),
        is_guest = EXCLUDED.is_guest
      `,
      [identity.alias, identity.email, identity.isGuest],
    );

    const profileResult = await pool.query(
      `
      WITH ranked AS (
        SELECT
          alias,
          email,
          elo,
          games_played,
          wins,
          losses,
          best_streak,
          current_streak,
          avg_guesses,
          fastest_solve,
          is_guest,
          ROW_NUMBER() OVER (ORDER BY elo DESC, wins DESC, games_played DESC) AS rank
        FROM users
      )
      SELECT *
      FROM ranked
      WHERE alias = $1
      LIMIT 1
      `,
      [identity.alias],
    );

    const modeResult = await pool.query(
      `
      SELECT mode, COUNT(*)::int AS count
      FROM matches
      WHERE player_id = (SELECT id FROM users WHERE alias = $1)
      GROUP BY mode
      ORDER BY count DESC
      LIMIT 1
      `,
      [identity.alias],
    );

    const row = profileResult.rows[0];
    if (!row) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        alias: row.alias,
        email: row.email,
        rank: Number(row.rank || 0),
        elo: Number(row.elo || 1000),
        gamesPlayed: Number(row.games_played || 0),
        wins: Number(row.wins || 0),
        losses: Number(row.losses || 0),
        winRate: row.games_played > 0 ? Math.round((Number(row.wins) / Number(row.games_played)) * 100) : 0,
        bestStreak: Number(row.best_streak || 0),
        currentStreak: Number(row.current_streak || 0),
        avgGuesses: Number(row.avg_guesses || 0),
        fastestSolve: Number(row.fastest_solve || 999),
        favoriteMode: modeResult.rows[0]?.mode || 'pve',
        isGuest: Boolean(row.is_guest),
      },
    });
  } catch (error) {
    console.warn('[API] Profile fetch failed:', (error as Error).message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
