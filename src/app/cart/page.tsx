import Link from 'next/link';
import { cartItems } from '@/lib/cart.ts';
import { shopInfo } from '@/lib/shop.ts';
import { RemoveFromCart } from '@/components/RemoveFromCart.tsx';
import { faMoney, faWeight } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const items = await cartItems();
  const available = items.filter((p) => p.stock > 0);
  const sold = items.filter((p) => p.stock < 1);
  const s = shopInfo();

  const goods = available.reduce((n, p) => n + p.price.total, 0);
  const vat   = available.reduce((n, p) => n + p.price.vat, 0);
  const total = goods + (available.length ? s.shipping : 0);

  return (
    <section className="band">
      <div className="wrap">
        <p className="eyebrow">سبد خرید</p>
        <h1>سبد خرید شما</h1>

        {items.length === 0 ? (
          <div className="stack" style={{ marginBlockStart: '1.5rem' }}>
            <p className="muted">سبد خرید خالی است.</p>
            <div><Link href="/shop" className="btn btn--gold">دیدن محصولات</Link></div>
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: '2rem', marginBlockStart: '1.5rem',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          }}>
            <div className="stack">
              {sold.length > 0 && (
                <div className="notice">
                  {sold.length} قطعه از سبد شما در این فاصله فروخته شد و در سفارش نمی‌آید.
                </div>
              )}
              {items.map((p) => (
                <div key={p.id} className="row" style={{
                  border: '1px solid var(--hairline)', borderRadius: 'var(--radius)',
                  padding: '.8rem', gap: '1rem', alignItems: 'flex-start',
                  opacity: p.stock < 1 ? .55 : 1,
                }}>
                  <img src={p.image} alt={p.name} width={90} height={90}
                       style={{ width: 90, height: 90, objectFit: 'cover',
                                borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${p.slug}`} style={{ fontWeight: 500 }}>{p.name}</Link>
                    <p className="small muted" style={{ margin: '.2rem 0' }}>
                      {p.weightGrams ? `${faWeight(p.weightGrams)} گرم` : ''}
                      {p.sizeLabel ? ` · ${p.sizeLabel}` : ''}
                    </p>
                    {p.stock < 1
                      ? <span className="pill pill--out">فروخته شد</span>
                      : <span className="num" style={{ fontWeight: 700, color: 'var(--gold-deep)' }}>
                          {faMoney(p.price.total)} تومان
                        </span>}
                  </div>
                  <RemoveFromCart productId={p.id} />
                </div>
              ))}
            </div>

            <aside>
              <dl className="breakdown">
                <div className="breakdown__row">
                  <dt>جمع کالاها ({available.length} قطعه)</dt>
                  <dd className="num">{faMoney(goods)} تومان</dd>
                </div>
                <div className="breakdown__row">
                  <dt>از این مبلغ، مالیات</dt>
                  <dd className="num">{faMoney(vat)} تومان</dd>
                </div>
                <div className="breakdown__row">
                  <dt>هزینه ارسال بیمه‌شده</dt>
                  <dd className="num">{available.length ? `${faMoney(s.shipping)} تومان` : '—'}</dd>
                </div>
                <div className="breakdown__row breakdown__row--total">
                  <dt>مبلغ قابل پرداخت</dt>
                  <dd className="num">{faMoney(total)} تومان</dd>
                </div>
              </dl>
              <div className="stack" style={{ marginBlockStart: '1rem', gap: '.6rem' }}>
                <Link href="/checkout"
                      className={`btn btn--gold btn--block${available.length ? '' : ' btn--disabled'}`}
                      aria-disabled={!available.length}>
                  ثبت سفارش
                </Link>
                <p className="small muted center">
                  برای ثبت سفارش وارد حساب می‌شوید. تا اینجا نیازی به ورود نبود.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
