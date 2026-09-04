import Link from 'next/link';
import type { Product } from '@/lib/shop.ts';
import { faMoney, faWeight, toFa } from '@/lib/format/fa.ts';

export function ProductCard({ p }: { p: Product }) {
  const sold = p.stock < 1;
  return (
    <Link href={`/product/${p.slug}`} className={`card${sold ? ' card--sold' : ''}`}>
      <div className="card__media">
        <img src={p.image} alt={p.name} loading="lazy" width={600} height={600} />
        {sold && <span className="card__badge">فروخته شد</span>}
        {!sold && p.karat && <span className="card__badge">{toFa(p.karat)} عیار</span>}
      </div>
      <div className="card__body">
        <span className="card__cat">{p.categoryName}</span>
        <span className="card__name">{p.name}</span>
        <span className="card__spec">
          {p.weightGrams ? `${faWeight(p.weightGrams)} گرم` : ''}
          {p.sizeLabel ? ` · ${p.sizeLabel}` : ''}
        </span>
        {p.color && (
          <span className="swatches"><i className={`swatch swatch--${p.color}`} /></span>
        )}
        <span className="card__price num">
          {faMoney(p.price.total)} <small>تومان</small>
        </span>
      </div>
    </Link>
  );
}
