/**
 * نشان گالری مظفر.
 *
 * طرح: نگین هشت‌ضلعی (تراش از رو به بالا) با حرف M مظفر در وسط.
 *
 * چرا هشت‌ضلعی و نه الماس نوک‌تیز؟ اول الماس کلاسیک کشیدم، ولی پایینش
 * نوک‌تیز است و حرف M داخلش جا نمی‌شد و خوانده نمی‌شد. نگین هشت‌ضلعی
 * وسطِ باز و پهن دارد، پس M راحت می‌نشیند و در اندازه کوچک هم پیداست.
 *
 * فقط خط است و پُری ندارد، تا روی زمینه روشن ظریف بماند.
 */
export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48"
      fill="none" className={className} aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="mg-gold" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0"   stopColor="#C9A227" />
          <stop offset=".45" stopColor="#A67C00" />
          <stop offset="1"   stopColor="#D9BC63" />
        </linearGradient>
      </defs>

      {/* بدنه نگین — هشت‌ضلعی */}
      <path
        d="M17 4h14l11 11v18L31 44H17L6 33V15z"
        stroke="url(#mg-gold)" strokeWidth="2.1"
        strokeLinejoin="round" strokeLinecap="round"
      />

      {/* تراش‌های گوشه — همان چیزی که به شکل حس «نگین» می‌دهد */}
      <path
        d="M6 15l6 5M42 15l-6 5M6 33l6-5M42 33l-6-5"
        stroke="url(#mg-gold)" strokeWidth="1.1"
        strokeLinecap="round" opacity=".55"
      />

      {/* حرف M — پایه چپ، بالا، دره وسط، بالا، پایه راست */}
      <path
        d="M15.5 32V17l8.5 9 8.5-9v15"
        stroke="url(#mg-gold)" strokeWidth="2.4"
        strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}
