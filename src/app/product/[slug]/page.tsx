import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productBySlug, allProducts, goldRates } from '@/lib/shop.ts';
import { ProductCard } from '@/components/ProductCard.tsx';
import { AddToCart } from '@/components/AddToCart.tsx';
import { faMoney, faWeight, faPercent, toFa, faDateTime } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

const COLOR_FA: Record<string, string> = {
  YELLOW: 'زرد', WHITE: 'سفید', ROSE: 'رزگلد',
};

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();

  const b = p.price;
  const rates = goldRates();
  const related = allProducts()
    .filter((x) => x.categorySlug === p.categorySlug && x.id !== p.id)
    .slice(0, 4);

  return (
    <section className="band">
      <div className="wrap">
        <p className="small muted" style={{ marginBlockEnd: '1rem' }}>
          <Link href="/">خانه</Link> ← <Link href="/shop">فروشگاه</Link> ←{' '}
          <Link href={`/shop?cat=${p.categorySlug}`}>{p.categoryName}</Link>
        </p>

        <div style={{
          display: 'grid', gap: '2.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'start',
        }}>
          {/* عکس */}
          <div style={{
            border: '1px solid var(--hairline)', borderRadius: 'var(--radius)',
            overflow: 'hidden', background: 'var(--bg-soft)',
          }}>
            <img src={p.image} alt={p.name} width={1000} height={1000}
                 style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
          </div>

          {/* اطلاعات */}
          <div className="stack">
            <div>
              <p className="eyebrow">{p.categoryName}</p>
              <h1 style={{ marginBlockEnd: '.3rem' }}>{p.name}</h1>
              <p className="small muted num">کد کالا: {p.sku}</p>
            </div>

            {p.description && <p className="muted">{p.description}</p>}

            {/* مشخصات فنی */}
            <dl className="breakdown">
              {p.weightGrams != null && (
                <div className="breakdown__row">
                  <dt>وزن</dt><dd className="num">{faWeight(p.weightGrams)} گرم</dd>
                </div>
              )}
              {p.karat && (
                <div className="breakdown__row">
                  <dt>عیار</dt><dd className="num">{toFa(p.karat)}</dd>
                </div>
              )}
              {p.sizeLabel && (
                <div className="breakdown__row"><dt>اندازه</dt><dd>{p.sizeLabel}</dd></div>
              )}
              {p.color && (
                <div className="breakdown__row">
                  <dt>رنگ طلا</dt>
                  <dd className="row" style={{ gap: '.4rem' }}>
                    <i className={`swatch swatch--${p.color}`} />{COLOR_FA[p.color]}
                  </dd>
                </div>
              )}
              {p.stone && (
                <div className="breakdown__row"><dt>نگین</dt><dd>{p.stone}</dd></div>
              )}
              <div className="breakdown__row">
                <dt>موجودی</dt>
                <dd>
                  {p.stock > 0
                    ? <span className="pill pill--ok">موجود — تک‌نسخه</span>
                    : <span className="pill pill--out">فروخته شد</span>}
                </dd>
              </div>
            </dl>

            {/* ریز قیمت — همان جدولی که خریدار ایرانی دنبالش می‌گردد */}
            <div>
              <h3 style={{ fontSize: '.95rem', marginBlockEnd: '.6rem' }}>محاسبه قیمت</h3>
              <dl className="breakdown">
                {p.type === 'JEWELRY' || p.type === 'BAR' ? (
                  <>
                    <div className="breakdown__row">
                      <dt>قیمت هر گرم ({toFa(p.karat ?? 18)} عیار)</dt>
                      <dd className="num">{faMoney(b.gramRateUsed)} تومان</dd>
                    </div>
                    <div className="breakdown__row">
                      <dt>ارزش طلا</dt>
                      <dd className="num">{faMoney(b.goldValue)} تومان</dd>
                    </div>
                    <div className="breakdown__row">
                      <dt>{p.type === 'BAR' ? 'کارمزد' : 'اجرت ساخت'} ({faPercent(b.ojratPercent)})</dt>
                      <dd className="num">{faMoney(b.ojrat)} تومان</dd>
                    </div>
                    {b.profit > 0 && (
                      <div className="breakdown__row">
                        <dt>سود فروشنده ({faPercent(b.profitPercent)})</dt>
                        <dd className="num">{faMoney(b.profit)} تومان</dd>
                      </div>
                    )}
                    <div className="breakdown__row">
                      <dt>مالیات بر ارزش افزوده ({faPercent(b.vatPercent)})</dt>
                      <dd className="num">{faMoney(b.vat)} تومان</dd>
                    </div>
                  </>
                ) : p.type === 'COIN' ? (
                  <>
                    <div className="breakdown__row">
                      <dt>نرخ بازار سکه</dt>
                      <dd className="num">{faMoney(b.goldValue)} تومان</dd>
                    </div>
                    <div className="breakdown__row">
                      <dt>سود فروشنده ({faPercent(b.profitPercent)})</dt>
                      <dd className="num">{faMoney(b.profit)} تومان</dd>
                    </div>
                  </>
                ) : (
                  <div className="breakdown__row">
                    <dt>قیمت ثابت</dt>
                    <dd className="num">{faMoney(b.total)} تومان</dd>
                  </div>
                )}
                <div className="breakdown__row breakdown__row--total">
                  <dt>قیمت نهایی</dt>
                  <dd className="num">{faMoney(b.total)} تومان</dd>
                </div>
              </dl>
              <p className="small muted" style={{ marginBlockStart: '.6rem' }}>
                قیمت بر اساس نرخ لحظه‌ای طلا — بروزرسانی: {faDateTime(rates.fetchedAt)}
              </p>
              {p.type !== 'SILVER' && (
                <p className="small muted">
                  مالیات فقط روی اجرت و سود بسته می‌شود؛ خود طلا معاف است.
                </p>
              )}
            </div>

            <AddToCart productId={p.id} disabled={p.stock < 1} />
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginBlockStart: '4rem' }}>
            <h2>محصولات مشابه</h2>
            <div className="grid">
              {related.map((x) => <ProductCard key={x.id} p={x} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
