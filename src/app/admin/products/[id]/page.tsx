import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/ProductForm.tsx';
import { categoryList, rawProduct } from '@/lib/products-admin.ts';
import { goldRates, settings } from '@/lib/shop.ts';

export const dynamic = 'force-dynamic';

export default async function EditProduct({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = rawProduct(Number(id));
  if (!p) notFound();

  const cats = categoryList();
  const r = goldRates();
  const s = settings();

  return (
    <>
      <p className="small muted"><Link href="/admin/products">← محصولات</Link></p>
      <h1 style={{ fontSize: '1.5rem' }}>{p.name_fa}</h1>
      <p className="muted small num" style={{ marginBlockEnd: '1.5rem' }}>
        کد کالا: {p.sku} · <Link href={`/product/${p.slug}`}>دیدن در سایت</Link>
      </p>
      <ProductForm
        productId={p.id}
        cats={cats}
        rates={{ gram18: r.gram18, gram21: r.gram21, gram24: r.gram24 }}
        cfg={{
          profitPercent: s.profitPercent, vatPercent: s.vatPercent,
          defaultOjrat: s.defaultOjratPercent, barFee: s.barFeePercent,
          coinProfit: s.coinProfitPercent,
        }}
        initial={{
          name_fa: p.name_fa, type: p.type, category_id: p.category_id,
          audience: p.audience, karat: p.karat ?? 18,
          weight_grams: p.weight_grams ?? '', size_label: p.size_label ?? '',
          color: p.color ?? 'YELLOW', stone: p.stone ?? '',
          ojrat_percent: p.ojrat_percent ?? '', fixed_price: p.fixed_price ?? '',
          coin_market: p.coin_market ?? '', description_fa: p.description_fa ?? '',
          stock: p.stock, featured: p.featured, image: p.image ?? '',
        }}
      />
    </>
  );
}
