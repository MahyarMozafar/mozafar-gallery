import Link from 'next/link';
import { posts } from '@/lib/shop.ts';
export const dynamic = 'force-dynamic';

export default function Blog() {
  const list = posts();
  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '48rem' }}>
        <p className="eyebrow">مجله</p>
        <h1>دانستنی‌های طلا</h1>
        <div className="stack" style={{ marginBlockStart: '2rem' }}>
          {list.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} style={{
              border: '1px solid var(--hairline)', borderRadius: 'var(--radius)',
              padding: '1.2rem',
            }}>
              <h3 style={{ marginBlockEnd: '.3rem' }}>{p.title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
