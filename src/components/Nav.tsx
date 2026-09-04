import Link from 'next/link';

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <Link href="/" className="brand">
          <span className="brand__fa">گالری مظفر</span>
          <span className="brand__en">MOZAFAR GALLERY</span>
        </Link>
        <nav className="nav__links">
          <Link href="/shop">فروشگاه</Link>
          <Link href="/shop?type=COIN">سکه و شمش</Link>
          <Link href="/calculator">ماشین‌حساب طلا</Link>
          <Link href="/blog">مجله</Link>
          <Link href="/about">درباره ما</Link>
        </nav>
        <div className="nav__actions">
          <Link href="/cart" className="btn">سبد خرید</Link>
          <Link href="/login" className="btn btn--gold">ورود</Link>
        </div>
      </div>
    </header>
  );
}
