import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth/session.ts';
import { cartItems } from '@/lib/cart.ts';
import { LogoutButton } from '@/components/LogoutButton.tsx';
import { faMoney, toFa } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

export default async function Account() {
  const u = await currentUser();
  if (!u) redirect('/login?returnTo=/account');

  const items = await cartItems();
  const total = items.filter((p) => p.stock > 0).reduce((n, p) => n + p.price.total, 0);

  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '44rem' }}>
        <p className="eyebrow">حساب کاربری</p>
        <h1>{u.name || 'خوش آمدید'}</h1>

        <dl className="breakdown" style={{ marginBlockStart: '1.5rem' }}>
          <div className="breakdown__row">
            <dt>شماره موبایل</dt>
            <dd className="num" style={{ direction: 'ltr' }}>{u.phone}</dd>
          </div>
          {u.role === 'ADMIN' && (
            <div className="breakdown__row">
              <dt>نقش</dt><dd><span className="pill pill--ok">مدیر</span></dd>
            </div>
          )}
          <div className="breakdown__row">
            <dt>سبد خرید</dt>
            <dd>
              {items.length
                ? <>{toFa(items.length)} قطعه — <span className="num">{faMoney(total)}</span> تومان</>
                : 'خالی'}
            </dd>
          </div>
        </dl>

        <div className="row" style={{ marginBlockStart: '1.5rem' }}>
          <Link href="/cart" className="btn btn--gold">دیدن سبد خرید</Link>
          <Link href="/shop" className="btn">ادامه خرید</Link>
          {u.role === 'ADMIN' && <Link href="/admin" className="btn">پنل مدیریت</Link>}
          <LogoutButton />
        </div>

        <div className="notice" style={{ marginBlockStart: '2rem' }}>
          تاریخچه سفارش‌ها بعد از ساخته شدن مرحله ثبت سفارش اینجا می‌آید.
        </div>
      </div>
    </section>
  );
}
