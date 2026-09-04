import Link from 'next/link';
import { ProductForm } from '@/components/ProductForm.tsx';
import { categoryList } from '@/lib/products-admin.ts';
import { goldRates, settings } from '@/lib/shop.ts';

export const dynamic = 'force-dynamic';

export default function NewProduct() {
  const cats = categoryList();
  const r = goldRates();
  const s = settings();
  return (
    <>
      <p className="small muted"><Link href="/admin/products">← محصولات</Link></p>
      <h1 style={{ fontSize: '1.5rem' }}>محصول تازه</h1>
      <p className="muted small" style={{ marginBlockEnd: '1.5rem' }}>
        قیمت را خودتان وارد نمی‌کنید — از وزن و عیار و اجرت حساب می‌شود.
        سمت چپ، نتیجه را زنده می‌بینید.
      </p>
      <ProductForm
        cats={cats}
        rates={{ gram18: r.gram18, gram21: r.gram21, gram24: r.gram24 }}
        cfg={{
          profitPercent: s.profitPercent, vatPercent: s.vatPercent,
          defaultOjrat: s.defaultOjratPercent, barFee: s.barFeePercent,
          coinProfit: s.coinProfitPercent,
        }}
      />
    </>
  );
}
