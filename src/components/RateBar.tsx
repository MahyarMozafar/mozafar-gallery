/** نوار قیمت لحظه‌ای بالای سایت — مثل nabigold و remasgallery. */
import { goldRates } from '@/lib/shop.ts';
import { faMoney, faDateTime, toFa } from '@/lib/format/fa.ts';

export function RateBar() {
  const r = goldRates();
  const up = r.changePercent >= 0;
  const chip = `rate__chip${up ? '' : ' rate__chip--down'}`;

  return (
    <div className="rate-bar">
      <div className="wrap rate-bar__inner">
        <span className="rate">
          <span className="rate__label">طلای ۱۸ عیار</span>
          <span className="rate__value num">{faMoney(r.gram18)}</span>
          <span className="rate__label">تومان</span>
          <span className={chip}>{up ? '▲' : '▼'} {toFa(Math.abs(r.changePercent))}٪</span>
        </span>
        <span className="rate">
          <span className="rate__label">طلای ۲۴ عیار</span>
          <span className="rate__value num">{faMoney(r.gram24)}</span>
          <span className="rate__label">تومان</span>
        </span>
        <span className="rate rate__time">بروزرسانی: {faDateTime(r.fetchedAt)}</span>
      </div>
    </div>
  );
}
