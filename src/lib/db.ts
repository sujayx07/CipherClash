import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;

// Initialize tables (run once)
export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alias TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        avatar_url TEXT,
        elo INTEGER DEFAULT 1000,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        avg_guesses NUMERIC(4,2) DEFAULT 0,
        fastest_solve INTEGER DEFAULT 999,
        country TEXT,
        is_guest BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID REFERENCES users(id),
        opponent_id UUID REFERENCES users(id),
        mode TEXT CHECK (mode IN ('pve', 'pvp')),
        result TEXT CHECK (result IN ('win', 'loss')),
        guesses_taken INTEGER,
        elo_change INTEGER,
        played_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('[DB] NeonDB tables initialized');
  } catch (err) {
    console.warn('[DB] Could not initialize tables (NeonDB may not be configured):', (err as Error).message);
  }
}
