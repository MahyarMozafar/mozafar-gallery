import { LoginForm } from '@/components/LoginForm.tsx';
export const dynamic = 'force-dynamic';

export default function Login() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', minHeight: '78vh' }}>
      {/* فرم — سمت راست، چون راست‌به‌چپ است و چشم از اینجا شروع می‌کند */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--pad)' }}>
        <div style={{ width: '100%', maxWidth: '23rem' }}>
          <p className="eyebrow">گالری مظفر</p>
          <h1 style={{ fontSize: '1.7rem' }}>ورود به حساب</h1>
          <p className="muted small" style={{ marginBlockEnd: '1.5rem' }}>
            شماره موبایل خود را وارد کنید. یک کد پنج‌رقمی برایتان پیامک می‌شود.
            اگر تا حالا خرید نکرده‌اید، حساب شما خودکار ساخته می‌شود.
          </p>
          <LoginForm />
        </div>
      </div>
      {/* عکس */}
      <div style={{ background: 'var(--bg-soft)', overflow: 'hidden' }}>
        <img src="/products/necklace-gem-22.jpg" alt=""
             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </section>
  );
}
