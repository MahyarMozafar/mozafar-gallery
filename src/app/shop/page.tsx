import Link from 'next/link';
import { allProducts, categories } from '@/lib/shop.ts';
import { ProductCard } from '@/components/ProductCard.tsx';

export const dynamic = 'force-dynamic';

export default async function Shop({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const cats = categories().filter((c) => c.count > 0);

  let items = allProducts();
  if (sp.cat)  items = items.filter((p) => p.categorySlug === sp.cat);
  if (sp.type) items = items.filter((p) => p.type === sp.type);
  if (sp.aud)  items = items.filter((p) => p.audience === sp.aud);
  if (sp.karat) items = items.filter((p) => String(p.karat) === sp.karat);

  const q = (k: string, v?: string) => {
    const next: Record<string, string> = {};
    for (const [a, b] of Object.entries(sp)) if (b) next[a] = b;
    if (v === undefined || next[k] === v) delete next[k]; else next[k] = v;
    const s = new URLSearchParams(next).toString();
    return s ? `/shop?${s}` : '/shop';
  };

  return (
    <section className="band">
      <div className="wrap">
        <p className="eyebrow">فروشگاه</p>
        <h1>همه محصولات</h1>

        <div className="stack" style={{ marginBlock: '1.5rem 2rem', gap: '.8rem' }}>
          <div className="chips">
            <Link href="/shop" className="chip" aria-pressed={!sp.cat && !sp.type}>همه</Link>
            {cats.map((c) => (
              <Link key={c.slug} href={q('cat', c.slug)} className="chip"
                    aria-pressed={sp.cat === c.slug}>{c.name}</Link>
            ))}
          </div>
          <div className="chips">
            <Link href={q('aud', 'WOMEN')} className="chip" aria-pressed={sp.aud === 'WOMEN'}>زنانه</Link>
            <Link href={q('aud', 'MEN')}   className="chip" aria-pressed={sp.aud === 'MEN'}>مردانه</Link>
            <Link href={q('aud', 'KIDS')}  className="chip" aria-pressed={sp.aud === 'KIDS'}>بچگانه</Link>
            <Link href={q('karat', '18')}  className="chip" aria-pressed={sp.karat === '18'}>۱۸ عیار</Link>
            <Link href={q('karat', '24')}  className="chip" aria-pressed={sp.karat === '24'}>۲۴ عیار</Link>
          </div>
        </div>

        <p className="muted small" style={{ marginBlockEnd: '1.2rem' }}>
          {items.length ? `${items.length} محصول` : 'محصولی با این فیلتر پیدا نشد.'}
        </p>

        <div className="grid">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
