import crypto from 'crypto';

export const GUEST_COOKIE_NAME = 'cc_guest_identity';

function getSigningSecret(): string {
  return process.env.IDENTITY_COOKIE_SECRET || process.env.NEXTAUTH_SECRET || 'cipherclash-dev-secret';
}

export function sanitizeAlias(input: string): string {
  const normalized = input.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
  return normalized.slice(0, 24) || createGuestAlias();
}

export function createGuestAlias(): string {
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `phantom_0x${hex}`;
}

function signValue(value: string): string {
  return crypto.createHmac('sha256', getSigningSecret()).update(value).digest('hex');
}

export function serializeSignedAlias(alias: string): string {
  const safeAlias = sanitizeAlias(alias);
  const signature = signValue(safeAlias);
  return `${safeAlias}.${signature}`;
}

export function verifySignedAlias(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;

  const [alias, signature] = cookieValue.split('.');
  if (!alias || !signature) return null;

  const safeAlias = sanitizeAlias(alias);
  const expected = signValue(safeAlias);

  const received = Buffer.from(signature, 'hex');
  const actual = Buffer.from(expected, 'hex');

  if (received.length !== actual.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(received, actual)) {
    return null;
  }

  return safeAlias;
}

export function buildGuestCookie(alias: string): {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: 'lax';
  httpOnly: boolean;
  secure: boolean;
} {
  return {
    name: GUEST_COOKIE_NAME,
    value: serializeSignedAlias(alias),
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
}
