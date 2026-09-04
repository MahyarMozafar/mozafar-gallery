import Link from 'next/link';
import { featuredProducts, categories, goldRates } from '@/lib/shop.ts';
import { ProductCard } from '@/components/ProductCard.tsx';
import { faMoney } from '@/lib/format/fa.ts';

export default function Home() {
  const featured = featuredProducts(8);
  const cats = categories().filter((c) => c.count > 0);
  const r = goldRates();

  return (
    <>
      <section className="hero">
        <div className="hero__media">
          <img src="/hero.jpg" alt="جواهرات طلا" width={1800} height={1000} />
        </div>
        <div className="wrap" style={{ position: 'relative' }}>
          <div className="hero__panel">
            <p className="eyebrow">گالری مظفر</p>
            <h1>طلایی که ماندگار است</h1>
            <p className="lead">
              خرید آنلاین طلا و جواهر با قیمت روز بازار، اجرت شفاف و فاکتور رسمی.
              هر قطعه با ضمانت اصالت و بسته‌بندی هدیه ارسال می‌شود.
            </p>
            <div className="row">
              <Link href="/shop" className="btn btn--gold">دیدن محصولات</Link>
              <Link href="/calculator" className="btn">ماشین‌حساب قیمت</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">دسته‌بندی</p>
              <h2>دنبال چه می‌گردید؟</h2>
            </div>
          </div>
          <div className="chips">
            {cats.map((c) => (
              <Link key={c.slug} href={`/shop?cat=${c.slug}`} className="chip">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--soft">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">منتخب</p>
              <h2>قطعه‌های ویژه</h2>
              <p className="lead">
                قیمت‌ها بر اساس نرخ گرم ۱۸ عیار «{faMoney(r.gram18)} تومان» و لحظه‌ای است.
              </p>
            </div>
            <Link href="/shop" className="btn">همه محصولات</Link>
          </div>
          <div className="grid">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="trust">
            {[
              ['ضمانت اصالت', 'هر قطعه با فاکتور رسمی و مهر گالری'],
              ['قیمت لحظه‌ای', 'بر اساس نرخ روز بازار، بدون قیمت قدیمی'],
              ['ارسال بیمه‌شده', 'پست سفارشی بیمه‌شده یا تحویل حضوری'],
              ['خرید طلای شما', 'طلای دست دوم را با نرخ روز می‌خریم'],
            ].map(([t, d]) => (
              <div key={t} className="trust__item">
                <p className="trust__title">{t}</p>
                <p className="trust__desc">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
