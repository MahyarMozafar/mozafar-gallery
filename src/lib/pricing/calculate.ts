/**
 * موتور قیمت‌گذاری — قلب پروژه.
 *
 * فرمول درست ایرانی (این را از چند منبع بررسی کردم؛ خیلی از وبلاگ‌ها اشتباه نوشته‌اند):
 *
 *   ارزش طلا = وزن × نرخ گرم آن عیار
 *   اجرت     = ارزش طلا × درصد اجرت
 *   سود      = (ارزش طلا + اجرت) × درصد سود     ← سود روی «طلا + اجرت» است
 *   مالیات   = (اجرت + سود) × درصد مالیات        ← مالیات هرگز روی خود طلا نیست
 *   قیمت نهایی = ارزش طلا + اجرت + سود + مالیات
 *
 * دو اشتباه رایجی که اینجا از آن دوری می‌کنیم:
 *  ۱) بعضی سود را فقط روی اجرت حساب می‌کنند — غلط است.
 *  ۲) بعضی مالیات را روی کل فاکتور می‌بندند — این تخلف است (گران‌فروشی).
 *     طلای خام طبق ماده ۲۶ قانون مالیات بر ارزش افزوده معاف است.
 */
import type {
  GoldRates,
  PriceBreakdown,
  PriceInput,
  ShopSettings,
} from './types.ts';
import { rateForKarat } from './derive.ts';

/** تنظیمات پیش‌فرض مغازه. مدیر از پنل عوضشان می‌کند. */
export const DEFAULT_SETTINGS: ShopSettings = {
  profitPercent: 7,        // سقف اتحادیه
  vatPercent: 10,          // ۱۴۰۴/۱۴۰۵ — قبلاً ۹٪ بود، عوض شد
  defaultOjratPercent: 12,
  barFeePercent: 1.5,
  coinProfitPercent: 2,
};

/** یک آبجکت خالی برای وقتی چیزی قابل قیمت‌گذاری نیست. */
function empty(gramRateUsed = 0): PriceBreakdown {
  return {
    goldValue: 0, ojrat: 0, ojratPercent: 0,
    profit: 0, profitPercent: 0,
    vat: 0, vatPercent: 0,
    total: 0, gramRateUsed,
  };
}

/**
 * قیمت یک محصول را حساب می‌کند و ریز اجزا را برمی‌گرداند.
 *
 * همیشه روی سرور صدا زده می‌شود، هرگز در مرورگر.
 * دلیل: اگر مرورگر قیمت را حساب کند، مشتری می‌تواند دستکاری‌اش کند.
 */
export function calculatePrice(
  input: PriceInput,
  rates: GoldRates,
  settings: ShopSettings = DEFAULT_SETTINGS,
): PriceBreakdown {
  switch (input.type) {
    case 'JEWELRY':
      return priceJewelry(input, rates, settings);
    case 'BAR':
      return priceBar(input, rates, settings);
    case 'COIN':
      return priceCoin(input, settings);
    case 'SILVER':
      return priceFixed(input);
    default:
      return empty();
  }
}

/** زیورآلات طلا — فرمول کامل با اجرت و سود و مالیات. */
function priceJewelry(
  input: PriceInput,
  rates: GoldRates,
  settings: ShopSettings,
): PriceBreakdown {
  const weight = input.weightGrams ?? 0;
  const karat = input.karat ?? 18;
  const gramRate = rateForKarat(rates, karat);

  const ojratPercent = input.ojratPercent ?? settings.defaultOjratPercent;
  const profitPercent = input.profitPercent ?? settings.profitPercent;
  const vatPercent = settings.vatPercent;

  // مرحله ۱ — ارزش خود طلا
  const goldValue = Math.round(weight * gramRate);

  // مرحله ۲ — اجرت ساخت، روی ارزش طلا
  const ojrat = Math.round(goldValue * (ojratPercent / 100));

  // مرحله ۳ — سود فروشنده، روی «طلا + اجرت»  (نه فقط اجرت!)
  const profit = Math.round((goldValue + ojrat) * (profitPercent / 100));

  // مرحله ۴ — مالیات، فقط روی «اجرت + سود»  (نه روی طلا!)
  const vat = Math.round((ojrat + profit) * (vatPercent / 100));

  return {
    goldValue,
    ojrat, ojratPercent,
    profit, profitPercent,
    vat, vatPercent,
    total: goldValue + ojrat + profit + vat,
    gramRateUsed: gramRate,
  };
}

/**
 * شمش طلا — اجرت ساخت ندارد، فقط یک کارمزد کوچک.
 * مالیات روی کارمزد بسته می‌شود، نه روی خود طلا.
 */
function priceBar(
  input: PriceInput,
  rates: GoldRates,
  settings: ShopSettings,
): PriceBreakdown {
  const weight = input.weightGrams ?? 0;
  const karat = input.karat ?? 24;
  const gramRate = rateForKarat(rates, karat);

  const feePercent = input.ojratPercent ?? settings.barFeePercent;
  const vatPercent = settings.vatPercent;

  const goldValue = Math.round(weight * gramRate);
  const fee = Math.round(goldValue * (feePercent / 100));
  const vat = Math.round(fee * (vatPercent / 100));

  return {
    goldValue,
    ojrat: fee, ojratPercent: feePercent,
    profit: 0, profitPercent: 0,
    vat, vatPercent,
    total: goldValue + fee + vat,
    gramRateUsed: gramRate,
  };
}

/**
 * سکه — وزنی نیست. نرخ بازار خودش را دارد و مغازه یک سود کوچک رویش می‌گذارد.
 * سکه معاف از مالیات ارزش افزوده است.
 */
function priceCoin(input: PriceInput, settings: ShopSettings): PriceBreakdown {
  const market = input.coinMarketToman ?? 0;
  const profitPercent = input.profitPercent ?? settings.coinProfitPercent;
  const profit = Math.round(market * (profitPercent / 100));

  return {
    goldValue: market,
    ojrat: 0, ojratPercent: 0,
    profit, profitPercent,
    vat: 0, vatPercent: 0,
    total: market + profit,
    gramRateUsed: 0,
  };
}

/** نقره و نگین — قیمت ثابت که مدیر دستی می‌گذارد. به نرخ طلا کاری ندارد. */
function priceFixed(input: PriceInput): PriceBreakdown {
  const total = input.fixedPriceToman ?? 0;
  return { ...empty(), goldValue: total, total };
}
