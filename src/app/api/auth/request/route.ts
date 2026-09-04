import { NextResponse } from 'next/server';
import { requestCode } from '@/lib/auth/otp.ts';

export async function POST(req: Request) {
  const { phone } = await req.json();
  const r = await requestCode(String(phone ?? ''));
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
