/**
 * انواع داده برای موتور قیمت‌گذاری.
 *
 * قانون طلایی: همه‌ی مبلغ‌ها «عدد صحیح تومان» هستند.
 * هرگز از اعشار برای پول استفاده نمی‌کنیم — اعشار در پول باعث خطای گرد کردن می‌شود.
 */

/** نوع محصول — هر کدام فرمول قیمت خودش را دارد. */
export type ProductType =
  | 'JEWELRY' // زیورآلات طلا: وزن × نرخ + اجرت + سود + مالیات
  | 'COIN'    // سکه: نرخ بازار سکه + سود مغازه (وزنی نیست)
  | 'BAR'     // شمش: وزن × نرخ + کارمزد کم (اجرت ندارد)
  | 'SILVER'  // نقره / نگین: قیمت ثابت دستی
  ;

export type Karat = 18 | 21 | 24;

export type GoldColor = 'YELLOW' | 'WHITE' | 'ROSE';

/** نرخ‌های لحظه‌ای بازار — همه به تومان. */
export interface GoldRates {
  /** قیمت یک گرم طلای ۱۸ عیار. تنها عددی که واقعاً از API می‌گیریم. */
  gram18: number;
  /** ۲۱ عیار — از ۱۸ عیار حساب می‌شود. */
  gram21: number;
  /** ۲۴ عیار (آب‌شده، خلوص ۹۹۵) — از ۱۸ عیار حساب می‌شود. */
  gram24: number;
  /** نرخ خرید از مشتری (۷۴۰) — کسری ذوب را جبران می‌کند. */
  gram740: number;
  /** مثقال (۴.۶۰۸ گرم، عیار ۱۷). */
  mesghal: number;
  /** درصد تغییر نسبت به دیروز، برای نوار بالای سایت. */
  changePercent: number;
  /** چه زمانی گرفته شد. */
  fetchedAt: Date;
  /** از کجا آمد: 'manual' یا 'brsapi' و غیره. */
  source: string;
}

/** تنظیمات مغازه که مدیر از پنل عوض می‌کند. */
export interface ShopSettings {
  /** درصد سود فروشنده. سقف اتحادیه ۷٪ است. */
  profitPercent: number;
  /** درصد مالیات بر ارزش افزوده. برای ۱۴۰۴/۱۴۰۵ برابر ۱۰٪. */
  vatPercent: number;
  /** اجرت پیش‌فرض، اگر محصول اجرت خودش را نداشته باشد. */
  defaultOjratPercent: number;
  /** کارمزد شمش، درصد. */
  barFeePercent: number;
  /** سود روی سکه، درصد. */
  coinProfitPercent: number;
}

/** ورودی محاسبه — فقط چیزهایی که روی قیمت اثر دارند. */
export interface PriceInput {
  type: ProductType;
  /** وزن به گرم. برای سکه و نقره لازم نیست. */
  weightGrams?: number;
  karat?: Karat;
  /** اجرت این قطعه، درصد. اگر ندهی، از تنظیمات برداشته می‌شود. */
  ojratPercent?: number;
  /** سود این قطعه، درصد. اگر ندهی، از تنظیمات برداشته می‌شود. */
  profitPercent?: number;
  /** قیمت ثابت برای نقره/نگین — تومان. */
  fixedPriceToman?: number;
  /** نرخ بازار این سکه — تومان. */
  coinMarketToman?: number;
}

/**
 * خروجی محاسبه — ریز به ریز، همان چیزی که در جدول صفحه محصول نشان می‌دهیم.
 * هر عدد «تومان صحیح» است.
 */
export interface PriceBreakdown {
  /** ارزش خود طلا: وزن × نرخ گرم */
  goldValue: number;
  /** اجرت ساخت */
  ojrat: number;
  /** اجرت، به درصد — برای نمایش */
  ojratPercent: number;
  /** سود فروشنده */
  profit: number;
  profitPercent: number;
  /** مالیات بر ارزش افزوده */
  vat: number;
  vatPercent: number;
  /** قیمت نهایی که مشتری می‌پردازد */
  total: number;
  /** نرخ گرمی که این محاسبه با آن انجام شد — برای فاکتور */
  gramRateUsed: number;
}
