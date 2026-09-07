import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, hashPassword } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const expectedPlain = process.env.PLANNING_PASSWORD || '';

  if (!expectedPlain || password !== expectedPlain) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  const token = await hashPassword(expectedPlain);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
