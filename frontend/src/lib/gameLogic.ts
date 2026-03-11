// Algorithm Implementation: Calculate Feedback
export function getFeedback(guess: string, secret: string) {
  let exact = 0;
  let numbers = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else if (secret.includes(guess[i])) {
      numbers++;
    }
  }
  return { exact, numbers };
}

// Generate valid secret (4 unique digits)
export function generateSecret(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let secret = '';
  // Fisher-Yates shuffle
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  // take first 4
  secret = digits.slice(0, 4).join('');
  return secret;
}

// Validation: 4 digits, unique
export function isValidGuess(guess: string): boolean {
  if (guess.length !== 4) return false;
  if (!/^\d+$/.test(guess)) return false;
  const unique = new Set(guess);
  return unique.size === 4;
}
