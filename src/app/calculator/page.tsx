import { goldRates, settings } from '@/lib/shop.ts';
import { Calculator } from '@/components/Calculator.tsx';
import { faMoney } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ماشین‌حساب قیمت طلا | گالری مظفر',
  description: 'قیمت طلا را بر اساس وزن، عیار و اجرت حساب کنید. با نرخ لحظه‌ای بازار.',
};

export default function CalculatorPage() {
  const r = goldRates();
  const s = settings();

  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '46rem' }}>
        <p className="eyebrow">ابزار</p>
        <h1>ماشین‌حساب قیمت طلا</h1>
        <p className="lead">
          وزن و عیار را وارد کنید تا قیمت را با فرمول رسمی ببینید.
          نرخ پایه: هر گرم ۱۸ عیار «{faMoney(r.gram18)} تومان».
        </p>

        <Calculator
          gram18={r.gram18} gram21={r.gram21} gram24={r.gram24}
          gram740={r.gram740}
          defaultOjrat={s.defaultOjratPercent}
          profitPercent={s.profitPercent}
          vatPercent={s.vatPercent}
        />

        <div style={{ marginBlockStart: '2.5rem' }}>
          <h2>فرمول چطور کار می‌کند؟</h2>
          <dl className="breakdown">
            <div className="breakdown__row"><dt>۱. ارزش طلا</dt><dd>وزن × نرخ گرم</dd></div>
            <div className="breakdown__row"><dt>۲. اجرت ساخت</dt><dd>ارزش طلا × درصد اجرت</dd></div>
            <div className="breakdown__row"><dt>۳. سود فروشنده</dt><dd>(ارزش طلا + اجرت) × درصد سود</dd></div>
            <div className="breakdown__row"><dt>۴. مالیات</dt><dd>(اجرت + سود) × درصد مالیات</dd></div>
            <div className="breakdown__row breakdown__row--total">
              <dt>قیمت نهایی</dt><dd>جمع چهار مورد بالا</dd>
            </div>
          </dl>
          <p className="small muted" style={{ marginBlockStart: '.8rem' }}>
            دو نکته که خیلی‌ها اشتباه می‌کنند: سود روی «طلا + اجرت» حساب می‌شود، نه فقط روی اجرت.
            و مالیات هرگز روی خود طلا بسته نمی‌شود — طلای خام طبق ماده ۲۶ قانون
            مالیات بر ارزش افزوده معاف است.
          </p>
        </div>
      </div>
    </section>
  );
}
