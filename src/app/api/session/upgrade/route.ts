import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { buildGuestCookie, createGuestAlias, GUEST_COOKIE_NAME, sanitizeAlias, verifySignedAlias } from '@/lib/identity';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alias = sanitizeAlias(session?.user?.name || email.split('@')[0] || 'operative');
    const cookieStore = await cookies();
    const guestAlias = verifySignedAlias(cookieStore.get(GUEST_COOKIE_NAME)?.value);

    await pool.query(
      `
      INSERT INTO users (alias, email, is_guest)
      VALUES ($1, $2, false)
      ON CONFLICT (alias) DO UPDATE SET
        email = EXCLUDED.email,
        is_guest = false
      `,
      [alias, email],
    );

    if (guestAlias && guestAlias !== alias) {
      await pool.query(
        `
        UPDATE matches
        SET player_id = (SELECT id FROM users WHERE alias = $1)
        WHERE player_id = (SELECT id FROM users WHERE alias = $2)
        `,
        [alias, guestAlias],
      );

      await pool.query(
        `
        UPDATE users real
        SET
          elo = real.elo + guest.elo - 1000,
          games_played = real.games_played + guest.games_played,
          wins = real.wins + guest.wins,
          losses = real.losses + guest.losses,
          best_streak = GREATEST(real.best_streak, guest.best_streak),
          current_streak = GREATEST(real.current_streak, guest.current_streak),
          avg_guesses = CASE
            WHEN real.games_played + guest.games_played > 0 THEN
              ROUND(((real.avg_guesses * real.games_played) + (guest.avg_guesses * guest.games_played))::numeric / (real.games_played + guest.games_played), 2)
            ELSE 0
          END,
          fastest_solve = LEAST(real.fastest_solve, guest.fastest_solve)
        FROM users guest
        WHERE real.alias = $1
          AND guest.alias = $2
          AND real.alias <> guest.alias
        `,
        [alias, guestAlias],
      );

      await pool.query(`DELETE FROM users WHERE alias = $1 AND email IS NULL`, [guestAlias]);
    }

    const response = NextResponse.json({ success: true, alias });
    response.cookies.set(buildGuestCookie(createGuestAlias()));
    return response;
  } catch (error) {
    console.warn('[API] Session upgrade failed:', (error as Error).message);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
