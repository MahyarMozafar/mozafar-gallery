/**
 * تست‌های موتور قیمت.
 * اجرا:  npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, DEFAULT_SETTINGS } from './calculate.ts';
import {
  deriveRates, gramForKarat, buybackRate,
  gram18FromMesghal, mesghalFromGram18,
} from './derive.ts';

const rates = (g18: number) => deriveRates(g18);

test('نمونه ۱: ۱ گرم، نرخ ۲۰ میلیون، اجرت ۱۰٪، سود ۷٪، مالیات ۱۰٪ → ۲۳٬۸۹۴٬۰۰۰', () => {
  const r = calculatePrice(
    { type: 'JEWELRY', weightGrams: 1, karat: 18, ojratPercent: 10, profitPercent: 7 },
    rates(20_000_000),
    { ...DEFAULT_SETTINGS, vatPercent: 10 },
  );
  assert.equal(r.goldValue, 20_000_000);
  assert.equal(r.ojrat,      2_000_000);
  assert.equal(r.profit,     1_540_000); // (۲۰م + ۲م) × ۷٪  ← نه فقط روی اجرت
  assert.equal(r.vat,          354_000); // (۲م + ۱٫۵۴م) × ۱۰٪
  assert.equal(r.total,     23_894_000);
});

test('نمونه ۲: ۳ گرم، نرخ ۲٫۵ میلیون، مالیات قدیمی ۹٪ → ۸٬۹۴۶٬۹۷۵', () => {
  const r = calculatePrice(
    { type: 'JEWELRY', weightGrams: 3, karat: 18, ojratPercent: 10, profitPercent: 7 },
    rates(2_500_000),
    { ...DEFAULT_SETTINGS, vatPercent: 9 },
  );
  assert.equal(r.goldValue, 7_500_000);
  assert.equal(r.ojrat,       750_000);
  assert.equal(r.profit,      577_500); // (۷٫۵م + ۷۵۰ه) × ۷٪
  assert.equal(r.vat,         119_475); // (۷۵۰ه + ۵۷۷٫۵ه) × ۹٪
  assert.equal(r.total,     8_946_975);

  // نکته: یک وبلاگ فارسی برای همین مثال عدد ۸٬۹۵۵٬۱۵۰ نوشته بود، با سود ۵۸۵٬۰۰۰.
  // ولی ۵۸۵٬۰۰۰ نه ۷٪ «طلا+اجرت» است (می‌شود ۷٫۰۹٪) و نه ۷٪ طلای تنها (می‌شود ۷٫۸٪).
  // یعنی حساب خودشان با خودشان نمی‌خواند. عدد بالا درست است.
});

test('مالیات هرگز روی خود طلا بسته نمی‌شود', () => {
  const r = calculatePrice(
    { type: 'JEWELRY', weightGrams: 5, karat: 18, ojratPercent: 12, profitPercent: 7 },
    rates(22_000_000),
  );
  // مالیات باید دقیقاً برابر (اجرت + سود) × ۱۰٪ باشد
  assert.equal(r.vat, Math.round((r.ojrat + r.profit) * 0.10));
  // و باید خیلی کوچک‌تر از ۱۰٪ کل باشد، چون طلا معاف است
  assert.ok(r.vat < r.total * 0.05);
});

test('سود روی (طلا + اجرت) است، نه فقط روی اجرت', () => {
  const r = calculatePrice(
    { type: 'JEWELRY', weightGrams: 2, karat: 18, ojratPercent: 15, profitPercent: 7 },
    rates(22_000_000),
  );
  assert.equal(r.profit, Math.round((r.goldValue + r.ojrat) * 0.07));
  assert.notEqual(r.profit, Math.round(r.ojrat * 0.07));
});

test('تبدیل عیار — همان عددی که در nabigold.com دیدم', () => {
  // ۱۹٬۹۵۰٬۰۰۰ × ۹۹۵ ÷ ۷۵۰ = ۲۶٬۴۶۷٬۰۰۰  ← دقیقاً ۲۴ عیار آن سایت
  assert.equal(gramForKarat(19_950_000, 24), 26_467_000);
});

test('۲۱ عیار و نرخ خرید ۷۴۰', () => {
  assert.equal(gramForKarat(22_000_000, 21), Math.round(22_000_000 * 875 / 750));
  assert.equal(buybackRate(22_000_000),      Math.round(22_000_000 * 740 / 750));
  // نرخ خرید باید کمتر از نرخ فروش باشد
  assert.ok(buybackRate(22_000_000) < 22_000_000);
});

test('مثقال و گرم باید رفت و برگشتشان بخواند', () => {
  const g = 22_000_000;
  const back = gram18FromMesghal(mesghalFromGram18(g));
  assert.ok(Math.abs(back - g) < 10, `انتظار ~${g} بود، ${back} آمد`);
});

test('شمش: اجرت ندارد، فقط کارمزد', () => {
  const r = calculatePrice(
    { type: 'BAR', weightGrams: 10, karat: 24 },
    rates(22_000_000),
  );
  assert.equal(r.profit, 0);
  assert.ok(r.ojrat > 0);           // کارمزد
  assert.ok(r.total > r.goldValue);
});

test('سکه: نرخ بازار خودش + سود، بدون مالیات', () => {
  const r = calculatePrice(
    { type: 'COIN', coinMarketToman: 900_000_000, profitPercent: 2 },
    rates(22_000_000),
  );
  assert.equal(r.vat, 0);
  assert.equal(r.total, 918_000_000);
});

test('نقره: قیمت ثابت، به نرخ طلا کاری ندارد', () => {
  const a = calculatePrice({ type: 'SILVER', fixedPriceToman: 4_500_000 }, rates(22_000_000));
  const b = calculatePrice({ type: 'SILVER', fixedPriceToman: 4_500_000 }, rates(99_000_000));
  assert.equal(a.total, 4_500_000);
  assert.equal(b.total, 4_500_000); // نرخ طلا ۴ برابر شد، قیمت نقره عوض نشد
});

test('تنظیم مغازه‌دار روی نرخ اثر می‌گذارد', () => {
  const plain = deriveRates(22_000_000);
  const up    = deriveRates(22_000_000, 0, 'manual', 1); // ۱٪ بالاتر
  assert.equal(plain.gram18, 22_000_000);
  assert.equal(up.gram18,    22_220_000);
});

test('همه‌ی مبلغ‌ها عدد صحیح هستند (پول اعشار ندارد)', () => {
  const r = calculatePrice(
    { type: 'JEWELRY', weightGrams: 3.337, karat: 18, ojratPercent: 13.5, profitPercent: 7 },
    rates(22_000_000),
  );
  for (const [k, v] of Object.entries(r)) {
    if (k.endsWith('Percent')) continue;
    assert.ok(Number.isInteger(v), `${k} باید عدد صحیح باشد ولی ${v} است`);
  }
});
