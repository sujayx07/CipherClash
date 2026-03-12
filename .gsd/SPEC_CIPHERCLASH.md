# SPEC: CipherClash Full Rebuild

## Requirements
1. Unified Next.js + Socket.io app (single `server.js`, no separate backend)
2. Two game modes: PvE (solo vs AI) and PvP (real-time multiplayer)
3. Bulls & Cows algorithm (4 unique digits)
4. Production robustness: 45s reconnection, session tokens, 30min room cleanup
5. World leaderboard with NeonDB (PostgreSQL), guests + authenticated users
6. NextAuth (Google + GitHub OAuth)
7. Animated landing page: hero, interactive tutorial, mode cards, leaderboard preview
8. Design system: JetBrains Mono + Syne, dark navy theme, glassmorphism, neon accents
9. Full Framer Motion animations: digit flips, page transitions, win/loss screens
10. Mobile responsive, touch-friendly keypad

## Constraints
- NO separate backend folder — everything unified
- NO white backgrounds, NO default fonts
- Secrets NEVER sent to frontend until game ends
- Server is sole source of truth for PvP
- NeonDB PostgreSQL for persistence (not Supabase)
- Guest aliases stored in localStorage, synced to DB on login

## Database (NeonDB)
- Connection: postgresql://neondb_owner:npg_x0fvSVO1GIHB@ep-late-poetry-an3s08s8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
- Tables: users, matches (same schema as spec but via pg/neon)

## Definition of Done
- [ ] `node server.js` boots cleanly on port 3000
- [ ] Landing page teaches game via animation (no text reading required)
- [ ] PvE: fully playable, score saved to leaderboard
- [ ] PvP: two players real-time, survives 45s disconnect
- [ ] Leaderboard: guests see rank, logged-in users have persistent ELO
- [ ] Every animation is intentional (digit flips, transitions, win/loss)
- [ ] Zero white backgrounds, zero default fonts, zero generic UI
- [ ] Mobile responsive with touch-friendly keypad
