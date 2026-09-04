/**
 * از «قیمت گرم ۱۸ عیار» بقیه‌ی نرخ‌ها را حساب می‌کند.
 *
 * چرا این‌طوری؟ چون سایت‌های خوب ایرانی هم همین کار را می‌کنند.
 * در nabigold.com دیدم:  ۱۹٬۹۵۰٬۰۰۰ × ۹۹۵ ÷ ۷۵۰ = ۲۶٬۴۶۷٬۰۰۰  ← دقیقاً همان ۲۴ عیارش.
 *
 * فایده‌اش: فقط یک عدد از API می‌گیریم، پس
 *  ۱) درخواست کمتر (داخل سهمیه رایگان می‌مانیم)
 *  ۲) عیارها هیچ‌وقت با هم نمی‌خوانند نمی‌شوند
 */
import type { GoldRates, Karat } from './types.ts';

/** خلوص هر عیار، از ۱۰۰۰. */
export const PURITY: Record<Karat, number> = {
  18: 750,  // مبنای فروش
  21: 875,
  24: 995,  // آب‌شده در عمل ۹۹۵ است، نه ۱۰۰۰
};

/** مبنای خرید از مشتری. کمتر از ۷۵۰ چون هنگام ذوب مقداری طلا از بین می‌رود. */
export const BUYBACK_PURITY = 740;

/** یک مثقال چند گرم است. */
export const MESGHAL_GRAMS = 4.608;

/** خلوص مثقال (عیار ۱۷). */
export const MESGHAL_PURITY = 705;

/** نرخ یک عیار دیگر را از روی نرخ ۱۸ عیار حساب می‌کند. */
export function gramForKarat(gram18: number, karat: Karat): number {
  return Math.round((gram18 * PURITY[karat]) / PURITY[18]);
}

/** نرخ خرید از مشتری (۷۴۰). */
export function buybackRate(gram18: number): number {
  return Math.round((gram18 * BUYBACK_PURITY) / PURITY[18]);
}

/** نرخ مثقال از روی نرخ گرم ۱۸ عیار. */
export function mesghalFromGram18(gram18: number): number {
  return Math.round((gram18 * MESGHAL_GRAMS * MESGHAL_PURITY) / PURITY[18]);
}

/** برعکس: از مثقال به گرم ۱۸ عیار. تقسیم بر ۴٫۳۳۱۸ همان میان‌بر معروف است. */
export function gram18FromMesghal(mesghal: number): number {
  return Math.round((mesghal / MESGHAL_GRAMS) * (PURITY[18] / MESGHAL_PURITY));
}

/**
 * از یک عدد (نرخ گرم ۱۸ عیار) کل مجموعه نرخ‌ها را می‌سازد.
 *
 * @param gram18          نرخ خام گرم ۱۸ عیار، تومان
 * @param changePercent   درصد تغییر نسبت به دیروز
 * @param source          از کجا آمد
 * @param adjustmentPercent  تنظیم مغازه‌دار (±درصد). سایت‌های واقعی هم این کار را می‌کنند:
 *                           remasgallery و nabigold در یک لحظه دو عدد متفاوت نشان می‌دادند.
 */
export function deriveRates(
  gram18: number,
  changePercent = 0,
  source = 'manual',
  adjustmentPercent = 0,
): GoldRates {
  const base = Math.round(gram18 * (1 + adjustmentPercent / 100));
  return {
    gram18: base,
    gram21: gramForKarat(base, 21),
    gram24: gramForKarat(base, 24),
    gram740: buybackRate(base),
    mesghal: mesghalFromGram18(base),
    changePercent,
    fetchedAt: new Date(),
    source,
  };
}

/** نرخ گرم مناسب برای یک عیار را از مجموعه نرخ‌ها برمی‌دارد. */
export function rateForKarat(rates: GoldRates, karat: Karat): number {
  if (karat === 18) return rates.gram18;
  if (karat === 21) return rates.gram21;
  return rates.gram24;
}
