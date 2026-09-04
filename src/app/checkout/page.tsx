import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cartItems } from '@/lib/cart.ts';
import { currentUser } from '@/lib/auth/session.ts';
import { shopInfo, goldRates } from '@/lib/shop.ts';
import { faMoney, toFa, faDateTime } from '@/lib/format/fa.ts';
import { getSettingNum } from '@/lib/db/index.ts';

export const dynamic = 'force-dynamic';

export default async function Checkout() {
  // تنها جایی از کل سایت که ورود لازم است
  const user = await currentUser();
  if (!user) redirect('/login?returnTo=/checkout');

  const items = (await cartItems()).filter((p) => p.stock > 0);
  const s = shopInfo();
  const r = goldRates();
  const goods = items.reduce((n, p) => n + p.price.total, 0);
  const total = goods + (items.length ? s.shipping : 0);
  const payWindow = getSettingNum('paymentWindowMinutes', 30);

  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '46rem' }}>
        <p className="eyebrow">ثبت سفارش</p>
        <h1>تکمیل خرید</h1>

        {items.length === 0 ? (
          <>
            <p className="muted">سبد خرید خالی است.</p>
            <Link href="/shop" className="btn btn--gold">دیدن محصولات</Link>
          </>
        ) : (
          <div className="stack" style={{ gap: '1.5rem', marginBlockStart: '1.5rem' }}>
            <dl className="breakdown">
              {items.map((p) => (
                <div key={p.id} className="breakdown__row">
                  <dt>{p.name}</dt>
                  <dd className="num">{faMoney(p.price.total)} تومان</dd>
                </div>
              ))}
              <div className="breakdown__row">
                <dt>ارسال بیمه‌شده</dt><dd className="num">{faMoney(s.shipping)} تومان</dd>
              </div>
              <div className="breakdown__row breakdown__row--total">
                <dt>مبلغ قابل پرداخت</dt><dd className="num">{faMoney(total)} تومان</dd>
              </div>
            </dl>

            <div className="notice">
              <p style={{ margin: 0 }}>
                <b>قیمت این سفارش ثابت می‌شود.</b> با ثبت سفارش، مبلغ بالا داخل سفارش
                نوشته می‌شود و بعد از آن هرگز عوض نمی‌شود — حتی اگر نرخ طلا بالا برود.
              </p>
              <p style={{ margin: '.5rem 0 0' }} className="small">
                نرخ مبنا: هر گرم ۱۸ عیار {faMoney(r.gram18)} تومان
                — {faDateTime(r.fetchedAt)}
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.05rem' }}>روش پرداخت: کارت به کارت</h2>
              <dl className="breakdown">
                <div className="breakdown__row">
                  <dt>شماره کارت</dt>
                  <dd className="num" style={{ direction: 'ltr' }}>{s.card}</dd>
                </div>
                <div className="breakdown__row"><dt>به نام</dt><dd>{s.holder}</dd></div>
                <div className="breakdown__row">
                  <dt>مهلت آپلود رسید</dt><dd className="num">{toFa(payWindow)} دقیقه</dd>
                </div>
              </dl>
              <p className="small muted" style={{ marginBlockStart: '.6rem' }}>
                بعد از واریز، عکس رسید را آپلود می‌کنید و ما تأیید می‌کنیم.
                قطعه تا آن موقع برای شما کنار گذاشته می‌شود.
              </p>
            </div>

            <div className="notice">
              <b>در دست ساخت.</b> این صفحه فعلاً فقط مبلغ را نشان می‌دهد.
              مرحله بعد: ورود با پیامک، رزرو موجودی، و آپلود رسید.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
