export type MatchMode = 'pve' | 'pvp';
export type MatchResult = 'win' | 'loss';

export interface ScoreContext {
  mode: MatchMode;
  result: MatchResult;
  guessesTaken: number;
  gamesPlayedBefore: number;
  currentStreakBefore: number;
}

export function computeScoreDelta(context: ScoreContext): number {
  const participationBonus = 8;
  const modeBonus = context.mode === 'pvp' ? 6 : 4;
  const resultBonus = context.result === 'win' ? 32 : 2;

  const boundedGuesses = Math.max(1, context.guessesTaken || 1);
  const efficiencyBonus = Math.max(0, 16 - boundedGuesses * 2);

  const streakSource = context.result === 'win' ? context.currentStreakBefore + 1 : 0;
  const streakBonus = Math.min(streakSource * 3, 24);

  const activityBonus = (context.gamesPlayedBefore + 1) % 5 === 0 ? 10 : 0;

  return participationBonus + modeBonus + resultBonus + efficiencyBonus + streakBonus + activityBonus;
}
