import Link from 'next/link';
import { cartCount } from '@/lib/cart.ts';
import { currentUser } from '@/lib/auth/session.ts';
import { toFa } from '@/lib/format/fa.ts';
import { Logo } from './Logo.tsx';
import { MobileMenu } from './MobileMenu.tsx';

export const NAV_LINKS = [
  { href: '/shop',            label: 'فروشگاه' },
  { href: '/shop?type=COIN',  label: 'سکه و شمش' },
  { href: '/calculator',      label: 'ماشین‌حساب طلا' },
  { href: '/blog',            label: 'مجله' },
  { href: '/about',           label: 'درباره ما' },
];

export async function Nav() {
  const [count, user] = await Promise.all([cartCount(), currentUser()]);
  const accountHref  = user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/login';
  const accountLabel = user ? (user.role === 'ADMIN' ? 'پنل مدیریت' : 'حساب من') : 'ورود';

  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <MobileMenu
          links={NAV_LINKS}
          accountHref={accountHref}
          accountLabel={accountLabel}
        />

        <Link href="/" className="brand">
          <Logo size={36} />
          <span className="brand__text">
            <span className="brand__fa">گالری مظفر</span>
            <span className="brand__en">MOZAFAR GALLERY</span>
          </span>
        </Link>

        <nav className="nav__links">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <div className="nav__actions">
          <Link href="/cart" className="btn cart-btn" aria-label="سبد خرید">
            <span className="cart-btn__text">سبد خرید</span>
            <svg className="cart-btn__icon" width="19" height="19" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M6 7h12l-1 12H7L6 7z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
            {count > 0 && <span className="cart-count num">{toFa(count)}</span>}
          </Link>
          <Link href={accountHref} className="btn btn--gold nav__account">{accountLabel}</Link>
        </div>
      </div>
    </header>
  );
}
