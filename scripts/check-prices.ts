import { DatabaseSync } from 'node:sqlite';
import { calculatePrice, DEFAULT_SETTINGS } from '../src/lib/pricing/calculate.ts';
import { deriveRates } from '../src/lib/pricing/derive.ts';
import { faToman, faWeight, faPercent } from '../src/lib/format/fa.ts';

const db = new DatabaseSync('data/shop.db');
const rates = deriveRates(22_000_000, 0.45);
const rows = db.prepare('SELECT * FROM products ORDER BY type, id').all() as any[];

console.log('نرخ گرم ۱۸ عیار:', faToman(rates.gram18));
console.log('نرخ گرم ۲۴ عیار:', faToman(rates.gram24), '(محاسبه‌شده ×۹۹۵/۷۵۰)');
console.log('نرخ خرید (۷۴۰) :', faToman(rates.gram740));
console.log('─'.repeat(78));
for (const r of rows) {
  const b = calculatePrice({
    type: r.type, weightGrams: r.weight_grams, karat: r.karat,
    ojratPercent: r.ojrat_percent ?? undefined,
    fixedPriceToman: r.fixed_price ?? undefined,
    coinMarketToman: r.coin_market ?? undefined,
  }, rates, DEFAULT_SETTINGS);
  const w = r.weight_grams ? faWeight(r.weight_grams) + 'گ' : '—';
  console.log(
    r.name_fa.padEnd(30, ' '),
    (r.karat ? r.karat + 'ع' : '—').padStart(4),
    w.padStart(9),
    faToman(b.total).padStart(24),
  );
}
db.close();
