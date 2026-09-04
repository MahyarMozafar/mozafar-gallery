import { shopInfo } from '@/lib/shop.ts';
export const dynamic = 'force-dynamic';
export default function Contact() {
  const s = shopInfo();
  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '40rem' }}>
        <p className="eyebrow">تماس</p>
        <h1>تماس با ما</h1>
        <dl className="breakdown" style={{ marginBlockStart: '1.5rem' }}>
          <div className="breakdown__row"><dt>تلفن</dt><dd className="num">{s.phone}</dd></div>
          <div className="breakdown__row"><dt>نشانی</dt><dd>{s.address}</dd></div>
          <div className="breakdown__row"><dt>ساعت کاری</dt><dd>شنبه تا پنجشنبه، ۱۰ تا ۲۰</dd></div>
        </dl>
      </div>
    </section>
  );
}
