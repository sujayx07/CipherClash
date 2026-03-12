// Game logic for CipherClash — Total Correct / Exact Positions feedback

/**
 * Evaluate a guess against a secret
 * Logic: 
 * - 'numbers' counts every digit that exists in the secret.
 * - 'exact' counts only those in the correct index.
 * Example: Secret 1234, Guess 5231 -> numbers: 3 (1,2,3), exact: 2 (2,3) -> Returns { 3, 2 }
 */
export function getFeedback(guess: string, secret: string): { numbers: number; exact: number } {
  let numbers = 0;
  let exact = 0;

  for (let i = 0; i < 4; i++) {
    // 1. Check for Exact Position
    if (guess[i] === secret[i]) {
      exact++;
    }
    
    // 2. Check for Total Numbers Correct (regardless of position)
    if (secret.includes(guess[i])) {
      numbers++;
    }
  }

  return { numbers, exact };
}

/**
 * Wrapper for the evaluation logic
 */
export function evaluateGuess(secret: string, guess: string): { numbers: number; exact: number } {
  return getFeedback(guess, secret);
}

/**
 * Generates a 4-digit secret with unique digits
 */
export function generateSecret(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  // Fisher-Yates Shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, 4).join('');
}

/**
 * Validates that the input is 4 unique digits
 */
export function isValidGuess(guess: string): boolean {
  if (guess.length !== 4) return false;
  if (!/^\d+$/.test(guess)) return false;
  const unique = new Set(guess);
  return unique.size === 4;
}