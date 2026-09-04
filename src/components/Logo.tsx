/**
 * نشان گالری مظفر.
 *
 * نگین برلیان از رو به بالا (هشت‌ضلعی با تراش‌های تاج) و حرف M مظفر در وسط.
 *
 * چند تصمیم که به لوکس بودنش کمک می‌کند:
 *  - خط‌ها مویی هستند (۱٫۵ و ۰٫۷). خط کلفت ارزان به نظر می‌رسد.
 *  - حرف M «سریف با ضخامت متغیر» است، نه هندسی. بدنه‌های مورب کلفت،
 *    بدنه‌های عمودی نازک، با سرکش (serif) در بالا و پایین — مثل حروف دیدون
 *    که برندهای جواهر استفاده می‌کنند.
 *  - تراش‌ها کم‌رنگ‌اند تا حواس را از حرف پرت نکنند.
 *  - هندسه هشت‌ضلعی دقیقاً حساب شده، نه تخمینی؛ تقارن کامل حس گران بودن می‌دهد.
 */
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48"
      fill="none" className={className} aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="mg-gold" x1="6" y1="5" x2="42" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0"   stopColor="#D9BC63" />
          <stop offset=".38" stopColor="#B98F16" />
          <stop offset=".72" stopColor="#8A6600" />
          <stop offset="1"   stopColor="#C9A227" />
        </linearGradient>
      </defs>

      {/* کمربند نگین */}
      <path
        d="M41.55 31.27 L31.27 41.55 L16.73 41.55 L6.45 31.27 L6.45 16.73 L16.73 6.45 L31.27 6.45 L41.55 16.73Z"
        fill="none" stroke="url(#mg-gold)" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* تراش‌های تاج — کم‌رنگ، فقط برای حس درخشش */}
      <path
        d="M41.55 31.27L31.95 27.29 M31.27 41.55L27.29 31.95 M16.73 41.55L20.71 31.95 M6.45 31.27L16.05 27.29 M6.45 16.73L16.05 20.71 M16.73 6.45L20.71 16.05 M31.27 6.45L27.29 16.05 M41.55 16.73L31.95 20.71"
        fill="none" stroke="url(#mg-gold)" strokeWidth=".7" strokeLinecap="round" opacity=".38"
      />
      {/* حرف M — سریف با ضخامت متغیر */}
      <path
        d="M17.0 30.6 L17.0 18.4 L15.6 17.0 L15.6 16.2 L19.9 16.2 L24.0 25.3 L28.1 16.2 L32.4 16.2 L32.4 17.0 L31.0 18.4 L31.0 30.6 L32.4 31.9 L32.4 32.7 L27.4 32.7 L27.4 31.9 L28.8 30.6 L28.8 20.4 L23.4 32.7 L22.6 32.7 L17.6 21.2 L17.6 30.6 L19.4 31.9 L19.4 32.7 L15.4 32.7 L15.4 31.9 Z"
        fill="url(#mg-gold)"
      />
    </svg>
  );
}
