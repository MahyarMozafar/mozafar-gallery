import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm.tsx';
import { currentUser } from '@/lib/auth/session.ts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ورود | گالری مظفر' };

export default async function Login({
  searchParams,
}: { searchParams: Promise<{ returnTo?: string }> }) {
  const u = await currentUser();
  const sp = await searchParams;

  // فقط مسیر داخلی — جلوی فرستادن کاربر به سایت بیرونی را می‌گیرد
  const raw = sp.returnTo ?? '/account';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';

  if (u) redirect(returnTo);

  return (
    <section className="login">
      <div className="login__form">
        <div style={{ width: '100%', maxWidth: '23rem' }}>
          <p className="eyebrow">گالری مظفر</p>
          <h1 style={{ fontSize: '1.7rem' }}>ورود به حساب</h1>
          <p className="muted small" style={{ marginBlockEnd: '1.5rem' }}>
            شماره موبایل خود را وارد کنید تا کد پنج‌رقمی برایتان بیاید.
            اگر تا حالا خرید نکرده‌اید، حساب شما خودکار ساخته می‌شود —
            نیازی به ثبت‌نام جداگانه نیست.
          </p>
          <LoginForm returnTo={returnTo} />
        </div>
      </div>
      <div className="login__art">
        <img src="/products/necklace-gem-22.jpg" alt="" />
      </div>
    </section>
  );
}
