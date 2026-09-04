'use client';
import { useState, useMemo } from 'react';

const FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const money = (n: number) => toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));
const toEn = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
   .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

interface Props {
  gram18: number; gram21: number; gram24: number; gram740: number;
  defaultOjrat: number; profitPercent: number; vatPercent: number;
}

export function Calculator(p: Props) {
  const [weight, setWeight] = useState('5');
  const [karat, setKarat]   = useState<18 | 21 | 24>(18);
  const [ojrat, setOjrat]   = useState(String(p.defaultOjrat));

  const out = useMemo(() => {
    const w = parseFloat(toEn(weight).replace(/[٫,]/g, '.')) || 0;
    const o = parseFloat(toEn(ojrat)) || 0;
    const rate = karat === 18 ? p.gram18 : karat === 21 ? p.gram21 : p.gram24;

    const gold   = Math.round(w * rate);
    const wage   = Math.round(gold * (o / 100));
    const profit = Math.round((gold + wage) * (p.profitPercent / 100));
    const vat    = Math.round((wage + profit) * (p.vatPercent / 100));
    return { rate, gold, wage, profit, vat, total: gold + wage + profit + vat, w };
  }, [weight, karat, ojrat, p]);

  const field: React.CSSProperties = {
    width: '100%', padding: '.65rem .8rem', fontSize: '1rem',
    border: '1px solid var(--hairline-2)', borderRadius: 'var(--radius-sm)',
    background: '#fff', fontFamily: 'inherit',
  };

  return (
    <div className="stack" style={{ marginBlockStart: '1.5rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
        <label className="stack" style={{ gap: '.35rem' }}>
          <span className="small muted">وزن (گرم)</span>
          <input style={field} value={weight} inputMode="decimal"
                 onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="stack" style={{ gap: '.35rem' }}>
          <span className="small muted">عیار</span>
          <select style={field} value={karat}
                  onChange={(e) => setKarat(Number(e.target.value) as 18 | 21 | 24)}>
            <option value={18}>۱۸ عیار</option>
            <option value={21}>۲۱ عیار</option>
            <option value={24}>۲۴ عیار (آب‌شده)</option>
          </select>
        </label>
        <label className="stack" style={{ gap: '.35rem' }}>
          <span className="small muted">اجرت (٪)</span>
          <input style={field} value={ojrat} inputMode="decimal"
                 onChange={(e) => setOjrat(e.target.value)} />
        </label>
      </div>

      <dl className="breakdown">
        <div className="breakdown__row">
          <dt>نرخ هر گرم</dt><dd className="num">{money(out.rate)} تومان</dd>
        </div>
        <div className="breakdown__row">
          <dt>ارزش طلا</dt><dd className="num">{money(out.gold)} تومان</dd>
        </div>
        <div className="breakdown__row">
          <dt>اجرت ساخت</dt><dd className="num">{money(out.wage)} تومان</dd>
        </div>
        <div className="breakdown__row">
          <dt>سود فروشنده ({toFa(p.profitPercent)}٪)</dt>
          <dd className="num">{money(out.profit)} تومان</dd>
        </div>
        <div className="breakdown__row">
          <dt>مالیات ارزش افزوده ({toFa(p.vatPercent)}٪)</dt>
          <dd className="num">{money(out.vat)} تومان</dd>
        </div>
        <div className="breakdown__row breakdown__row--total">
          <dt>قیمت نهایی</dt><dd className="num">{money(out.total)} تومان</dd>
        </div>
      </dl>

      <div className="notice">
        اگر بخواهید همین مقدار طلا را <b>بفروشید</b>، مغازه با نرخ ۷۴۰ می‌خرد:
        {' '}<b className="num">{money(out.w * p.gram740)} تومان</b>.
        اختلاف به خاطر کسری ذوب است.
      </div>
    </div>
  );
}
