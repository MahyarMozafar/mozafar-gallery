import Link from 'next/link';
import { notFound } from 'next/navigation';
import { postBySlug } from '@/lib/shop.ts';
export const dynamic = 'force-dynamic';

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = postBySlug(slug);
  if (!p) notFound();
  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '42rem' }}>
        <p className="small muted"><Link href="/blog">← مجله</Link></p>
        <h1>{p.title}</h1>
        <p className="lead">{p.excerpt}</p>
        <p>{p.body}</p>
      </div>
    </section>
  );
}
