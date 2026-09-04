import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession } from '@/lib/auth/otp.ts';
import { SESSION_COOKIE } from '@/lib/auth/session.ts';

export async function POST() {
  const jar = await cookies();
  destroySession(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
