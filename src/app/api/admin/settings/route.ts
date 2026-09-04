/** ذخیره تنظیمات مغازه. */
import { NextResponse } from 'next/server';
import { setSetting, migrate } from '@/lib/db/index.ts';
import { clearRateCache } from '@/lib/shop.ts';

/** فقط این کلیدها اجازه نوشتن دارند — جلوی نوشتن هر چیزی را می‌گیرد. */
const ALLOWED = new Set([
  'manualGram18', 'changePercent', 'priceAdjustment',
  'profitPercent', 'vatPercent', 'defaultOjratPercent',
  'barFeePercent', 'coinProfitPercent', 'shippingToman',
  'reservationMinutes', 'paymentWindowMinutes',
  'shopCardNumber', 'shopCardHolder', 'goldProvider',
]);

export async function POST(req: Request) {
  migrate();
  const body = await req.json();
  let saved = 0;

  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED.has(k)) continue;             // ← لیست سفید
    setSetting(k, String(v));
    saved++;
  }

  clearRateCache();   // نرخ عوض شد، کش را دور بریز
  return NextResponse.json({ ok: true, saved });
}
