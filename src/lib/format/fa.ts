/**
 * ابزارهای نمایش فارسی.
 *
 * قانون: عدد فارسی برای چیزی که مشتری می‌خواند (قیمت، وزن، تاریخ).
 *        عدد انگلیسی برای چیزی که کپی/تایپ می‌شود (شماره کارت، کد رهگیری، لینک).
 */

const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

/** جداکننده هزارگان فارسی — U+066C */
const FA_THOUSANDS = '٬';
/** جداکننده اعشار فارسی — U+066B */
const FA_DECIMAL = '٫';

/** رقم‌های انگلیسی را فارسی می‌کند. */
export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

/** رقم‌های فارسی و عربی را انگلیسی می‌کند — برای خواندن چیزی که کاربر تایپ کرده. */
export function toEn(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/**
 * مبلغ را به شکل فارسی با جداکننده می‌نویسد.
 * ۲۲۰۰۰۰۰۰ → «۲۲٬۰۰۰٬۰۰۰»
 */
export function faMoney(toman: number): string {
  const grouped = Math.round(toman).toLocaleString('en-US').replace(/,/g, FA_THOUSANDS);
  return toFa(grouped);
}

/** مبلغ با واحد. → «۲۲٬۰۰۰٬۰۰۰ تومان» */
export function faToman(toman: number): string {
  return `${faMoney(toman)} تومان`;
}

/**
 * وزن با اعشار فارسی.
 * ۵.۳۲۳ → «۵٫۳۲۳»
 */
export function faWeight(grams: number, decimals = 3): string {
  const [whole, frac] = grams.toFixed(decimals).split('.');
  const w = toFa(Number(whole).toLocaleString('en-US').replace(/,/g, FA_THOUSANDS));
  return frac ? `${w}${FA_DECIMAL}${toFa(frac)}` : w;
}

/** درصد. → «۱۲٪» */
export function faPercent(p: number): string {
  const s = Number.isInteger(p) ? String(p) : String(p).replace('.', FA_DECIMAL);
  return `${toFa(s)}٪`;
}

/**
 * مبلغی که کاربر تایپ کرده را می‌خواند.
 * قبول می‌کند: «۹۵٬۰۰۰» ، «95,000» ، «۹۵۰۰۰» ، «٩٥٠٠٠»
 */
export function parseMoney(input: string): number | null {
  const cleaned = toEn(input).replace(/[٬,\s_]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

const FA_MONTHS = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند',
];

/**
 * تاریخ شمسی با ساعت — «۲۹ مرداد ۱۴۰۵، ساعت ۲۰:۲۱»
 * دیجی‌کالا هم دقیقاً همین شکل را زیر قیمت طلا می‌نویسد و حس اعتماد می‌دهد.
 */
export function faDateTime(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    timeZone: 'Asia/Tehran',
  }).formatToParts(d);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const day = get('day');
  const month = FA_MONTHS[get('month') - 1] ?? '';
  const year = get('year');

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tehran',
  }).format(d);

  return `${toFa(day)} ${month} ${toFa(year)}، ساعت ${toFa(time)}`;
}

/** فقط تاریخ شمسی — «۲۹ مرداد ۱۴۰۵» */
export function faDate(d: Date): string {
  return faDateTime(d).split('،')[0];
}

/**
 * متن فارسی را یکدست می‌کند تا جست‌وجو درست کار کند.
 * ي عربی → ی فارسی ، ك عربی → ک فارسی ، حذف اعراب و نیم‌فاصله.
 * (این را از matching.py ربات تلگرام آوردم.)
 */
export function normalizeFa(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[ىيٰ]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/[ً-ٰٟـ]/g, '') // اعراب و کشیده
    .replace(/‌/g, ' ')                      // نیم‌فاصله
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
