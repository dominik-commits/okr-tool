import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, hashPassword } from './lib/auth';

export const config = {
  matcher: ['/((?!api/login|login|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await hashPassword(process.env.PLANNING_PASSWORD || '');
  const ok = Boolean(cookie) && cookie === expected;

  if (ok) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
