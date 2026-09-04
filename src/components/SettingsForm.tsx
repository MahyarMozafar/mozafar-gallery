'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const money = (n: number) => toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));

type Values = Record<string, string | number>;

export function SettingsForm({
  initial, currentRates,
}: {
  initial: Values;
  currentRates: { gram18: number; gram21: number; gram24: number; gram740: number };
}) {
  const [v, setV] = useState<Values>(initial);
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const router = useRouter();

  const set = (k: string) => (e: any) => {
    setV((old) => ({ ...old, [k]: e.target.value }));
    setState('idle');
  };

  // پیش‌نمایش زنده: مثال یک قطعه ۵ گرمی با همین تنظیمات
  const preview = useMemo(() => {
    const g18 = Number(v.manualGram18) || 0;
    const adj = Number(v.priceAdjustment) || 0;
    const rate = Math.round(g18 * (1 + adj / 100));
    const w = 5;
    const gold = Math.round(w * rate);
    const wage = Math.round(gold * (Number(v.defaultOjratPercent) || 0) / 100);
    const profit = Math.round((gold + wage) * (Number(v.profitPercent) || 0) / 100);
    const vat = Math.round((wage + profit) * (Number(v.vatPercent) || 0) / 100);
    return { rate, gold, wage, profit, vat, total: gold + wage + profit + vat,
             k24: Math.round(rate * 995 / 750), k740: Math.round(rate * 740 / 750) };
  }, [v]);

  async function save() {
    setState('busy');
    await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(v),
    });
    setState('done');
    router.refresh();
  }

  const F = ({ k, label, hint }: { k: string; label: string; hint?: string }) => (
    <label className="field">
      <span>{label}</span>
      <input value={String(v[k] ?? '')} onChange={set(k)} />
      {hint && <span style={{ fontSize: '.7rem' }}>{hint}</span>}
    </label>
  );

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0,2fr) minmax(260px,1fr)' }}>
      <div className="stack" style={{ gap: '1.6rem' }}>
        <section>
          <h2 style={{ fontSize: '1rem' }}>نرخ طلا</h2>
          <div className="form-grid">
            <F k="manualGram18"    label="نرخ گرم ۱۸ عیار (تومان)" hint="فقط همین عدد لازم است؛ بقیه عیارها خودکار حساب می‌شوند" />
            <F k="changePercent"   label="درصد تغییر امروز" hint="در نوار بالای سایت نشان داده می‌شود" />
            <F k="priceAdjustment" label="تنظیم نرخ (٪)" hint="مثبت یا منفی — حاشیه خودتان" />
            <label className="field">
              <span>منبع نرخ</span>
              <select value={String(v.goldProvider)} onChange={set('goldProvider')}>
                <option value="manual">دستی (همین عدد بالا)</option>
                <option value="brsapi">BrsApi — نیاز به کلید</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem' }}>درصدها</h2>
          <div className="form-grid">
            <F k="profitPercent"       label="سود فروشنده (٪)" hint="سقف اتحادیه ۷٪" />
            <F k="vatPercent"          label="مالیات ارزش افزوده (٪)" hint="۱۴۰۴/۱۴۰۵ برابر ۱۰٪" />
            <F k="defaultOjratPercent" label="اجرت پیش‌فرض (٪)" />
            <F k="barFeePercent"       label="کارمزد شمش (٪)" />
            <F k="coinProfitPercent"   label="سود سکه (٪)" />
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem' }}>سفارش و پرداخت</h2>
          <div className="form-grid">
            <F k="shippingToman"        label="هزینه ارسال (تومان)" />
            <F k="reservationMinutes"   label="مدت رزرو (دقیقه)" hint="از سبد تا ثبت سفارش" />
            <F k="paymentWindowMinutes" label="مهلت آپلود رسید (دقیقه)" hint="کارت به کارت زمان می‌برد" />
            <F k="shopCardNumber"       label="شماره کارت مغازه" />
            <F k="shopCardHolder"       label="نام صاحب کارت" />
          </div>
        </section>

        <div className="row">
          <button className="btn btn--gold" onClick={save} disabled={state === 'busy'}>
            {state === 'busy' ? 'در حال ذخیره…' : state === 'done' ? '✓ ذخیره شد' : 'ذخیره تنظیمات'}
          </button>
          {state === 'done' && <span className="small muted">قیمت همه محصولات بروز شد.</span>}
        </div>
      </div>

      <aside>
        <div className="tile tile--gold" style={{ marginBlockEnd: '1rem' }}>
          <p className="tile__label">پیش‌نمایش زنده</p>
          <p className="tile__note">یک قطعه ۵ گرمی ۱۸ عیار با همین تنظیمات:</p>
          <p className="tile__value num" style={{ fontSize: '1.25rem', marginBlockStart: '.4rem' }}>
            {money(preview.total)}
          </p>
          <p className="tile__note">تومان</p>
        </div>
        <dl className="breakdown">
          <div className="breakdown__row"><dt>نرخ مؤثر ۱۸ع</dt><dd className="num">{money(preview.rate)}</dd></div>
          <div className="breakdown__row"><dt>نرخ ۲۴ع (÷۷۵۰×۹۹۵)</dt><dd className="num">{money(preview.k24)}</dd></div>
          <div className="breakdown__row"><dt>نرخ خرید (۷۴۰)</dt><dd className="num">{money(preview.k740)}</dd></div>
          <div className="breakdown__row"><dt>ارزش طلا</dt><dd className="num">{money(preview.gold)}</dd></div>
          <div className="breakdown__row"><dt>اجرت</dt><dd className="num">{money(preview.wage)}</dd></div>
          <div className="breakdown__row"><dt>سود</dt><dd className="num">{money(preview.profit)}</dd></div>
          <div className="breakdown__row"><dt>مالیات</dt><dd className="num">{money(preview.vat)}</dd></div>
        </dl>
        <p className="small muted" style={{ marginBlockStart: '.7rem' }}>
          عددها همین‌جا و بدون ذخیره کردن عوض می‌شوند تا قبل از تأیید ببینید چه اتفاقی می‌افتد.
        </p>
      </aside>
    </div>
  );
}
