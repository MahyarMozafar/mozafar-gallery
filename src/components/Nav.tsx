import Link from 'next/link';
import { cartCount } from '@/lib/cart.ts';
import { currentUser } from '@/lib/auth/session.ts';
import { toFa } from '@/lib/format/fa.ts';

export async function Nav() {
  const [count, user] = await Promise.all([cartCount(), currentUser()]);

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
          <Link href="/cart" className="btn cart-btn">
            سبد خرید
            {count > 0 && <span className="cart-count num">{toFa(count)}</span>}
          </Link>
          {user ? (
            <Link href={user.role === 'ADMIN' ? '/admin' : '/account'} className="btn btn--gold">
              {user.role === 'ADMIN' ? 'پنل مدیریت' : 'حساب من'}
            </Link>
          ) : (
            <Link href="/login" className="btn btn--gold">ورود</Link>
          )}
        </div>
      </div>
    </header>
  );
}
