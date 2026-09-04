import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCode, createSession } from '@/lib/auth/otp.ts';
import { SESSION_COOKIE } from '@/lib/auth/session.ts';
import { mergeGuestCart } from '@/lib/cart.ts';

export async function POST(req: Request) {
  const { phone, code } = await req.json();
  const r = verifyCode(String(phone ?? ''), String(code ?? ''));
  if (!r.ok || !r.userId) {
    return NextResponse.json(r, { status: 400 });
  }

  const token = createSession(r.userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,           // جاوااسکریپت صفحه نمی‌تواند بخواندش
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  // سبد مهمان را به حساب کاربر می‌چسبانیم تا چیزی گم نشود
  const merged = await mergeGuestCart(r.userId);

  return NextResponse.json({ ok: true, isNew: r.isNew, merged });
}
