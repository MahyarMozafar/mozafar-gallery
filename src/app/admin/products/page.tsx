import Link from 'next/link';
import { adminProducts } from '@/lib/admin.ts';
import { faMoney, faWeight, faPercent, toFa } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

const TYPE_FA: Record<string, string> = {
  JEWELRY: 'زیورآلات', COIN: 'سکه', BAR: 'شمش', SILVER: 'نقره',
};

export default function AdminProducts() {
  const items = adminProducts();

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', marginBlockEnd: '1.2rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>محصولات</h1>
        <span className="muted small">{toFa(items.length)} قطعه</span>
      </div>

      <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>عکس</th><th>نام</th><th>کد</th><th>نوع</th><th>عیار</th>
              <th>وزن</th><th>اندازه</th><th>اجرت</th><th>ارزش طلا</th>
              <th>قیمت نهایی</th><th>موجودی</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.image} alt="" width={42} height={42}
                       style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 6 }} />
                </td>
                <td className="wide">{p.name}</td>
                <td className="num">{p.sku}</td>
                <td>{TYPE_FA[p.type] ?? p.type}</td>
                <td className="num">{p.karat ? toFa(p.karat) : '—'}</td>
                <td className="num">{p.weightGrams ? faWeight(p.weightGrams) : '—'}</td>
                <td>{p.sizeLabel ?? '—'}</td>
                <td className="num">{p.price.ojratPercent ? faPercent(p.price.ojratPercent) : '—'}</td>
                <td className="num">{p.price.goldValue ? faMoney(p.price.goldValue) : '—'}</td>
                <td className="num" style={{ fontWeight: 700, color: 'var(--gold-deep)' }}>
                  {faMoney(p.price.total)}
                </td>
                <td>
                  {p.stock > 0
                    ? <span className="pill pill--ok">{toFa(p.stock)}</span>
                    : <span className="pill pill--out">۰</span>}
                </td>
                <td><Link href={`/product/${p.slug}`} className="small">دیدن</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted small" style={{ marginBlockStart: '1rem' }}>
        قیمت‌ها همین الان از روی نرخ طلا حساب شدند. اگر نرخ را در تنظیمات عوض کنید،
        همه‌ی این اعداد با هم عوض می‌شوند.
      </p>
    </>
  );
}
