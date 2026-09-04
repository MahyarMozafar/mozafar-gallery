/** خواندن کاربر فعلی از کوکی. */
import 'server-only';
import { cookies } from 'next/headers';
import { userForToken, type SessionUser } from './otp.ts';

export const SESSION_COOKIE = 'mg_session';

export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  return userForToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionUser | null> {
  return currentUser();
}

/** فقط مدیر. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const u = await currentUser();
  return u?.role === 'ADMIN' ? u : null;
}
