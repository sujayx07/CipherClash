import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { buildGuestCookie, createGuestAlias, GUEST_COOKIE_NAME, sanitizeAlias, verifySignedAlias } from '@/lib/identity';

export async function POST() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const existingAlias = verifySignedAlias(cookieStore.get(GUEST_COOKIE_NAME)?.value);
  const headerAlias = headerStore.get('x-cc-guest-alias');
  const alias = existingAlias || (headerAlias ? sanitizeAlias(headerAlias) : createGuestAlias());

  const response = NextResponse.json({ alias });
  if (!existingAlias) {
    response.cookies.set(buildGuestCookie(alias));
  }

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const alias = verifySignedAlias(cookieStore.get(GUEST_COOKIE_NAME)?.value);
  return NextResponse.json({ status: 'ok', alias });
}
