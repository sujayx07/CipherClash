import { NextResponse } from 'next/server';

export async function POST() {
  // Generate guest alias
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
  const alias = `phantom_0x${hex}`;
  
  return NextResponse.json({ alias });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
