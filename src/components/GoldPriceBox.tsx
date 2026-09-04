'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const money = (n: number) => toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));
const toEn = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
   .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

/**
 * جعبه‌ی وارد کردن دستی نرخ طلا.
 * فقط یک عدد می‌خواهد: نرخ گرم ۱۸ عیار. بقیه خودکار حساب می‌شوند.
 */
export function GoldPriceBox({
  gram18, changePercent,
}: { gram18: number; changePercent: number }) {
  const [val, setVal]   = useState(String(gram18));
  const [chg, setChg]   = useState(String(changePercent));
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const n = Number(toEn(val).replace(/[٬,\s]/g, '')) || 0;
  const preview = {
    k21:  Math.round(n * 875 / 750),
    k24:  Math.round(n * 995 / 750),
    k740: Math.round(n * 740 / 750),
  };
  const changed = n !== gram18 || Number(toEn(chg)) !== changePercent;

  async function save() {
    setBusy(true);
    await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        manualGram18: n,
        changePercent: Number(toEn(chg)) || 0,
      }),
    });
    setBusy(false); setDone(true);
    router.refresh();
    setTimeout(() => setDone(false), 2500);
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '.7rem .85rem', fontSize: '1.15rem', fontWeight: 700,
    border: '1px solid var(--hairline-2)', borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit', background: '#fff',
  };

  return (
    <div style={{
      border: '1px solid #E8D9AE', background: 'var(--gold-soft)',
      borderRadius: 'var(--radius)', padding: '1.2rem',
    }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBlockEnd: '.8rem' }}>
        <h2 style={{ fontSize: '1rem', margin: 0 }}>نرخ طلا — وارد کردن دستی</h2>
        <span className="pill">فعلاً دستی · بعداً API</span>
      </div>

      <p className="small muted" style={{ marginBlockEnd: '1rem' }}>
        فقط نرخ <b>گرم ۱۸ عیار</b> را وارد کنید. ۲۱ و ۲۴ عیار و نرخ خرید خودشان
        حساب می‌شوند و قیمت همه‌ی محصولات با هم عوض می‌شود.
      </p>

      <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <label className="field">
          <span>نرخ گرم ۱۸ عیار (تومان)</span>
          <input style={input} value={val} inputMode="numeric"
                 onChange={(e) => { setVal(e.target.value); setDone(false); }} />
        </label>
        <label className="field">
          <span>تغییر امروز (٪)</span>
          <input style={{ ...input, fontSize: '1rem' }} value={chg} inputMode="decimal"
                 onChange={(e) => { setChg(e.target.value); setDone(false); }} />
        </label>
      </div>

      <div className="row" style={{ gap: '1.2rem', marginBlock: '.9rem', fontSize: '.83rem' }}>
        <span className="muted">۲۱ عیار: <b className="num">{money(preview.k21)}</b></span>
        <span className="muted">۲۴ عیار: <b className="num">{money(preview.k24)}</b></span>
        <span className="muted">خرید (۷۴۰): <b className="num">{money(preview.k740)}</b></span>
      </div>

      <div className="row">
        <button className="btn btn--gold" onClick={save} disabled={busy || n <= 0}>
          {busy ? 'در حال ذخیره…' : done ? '✓ ذخیره شد' : 'ذخیره نرخ'}
        </button>
        {changed && !done && <span className="small muted">تغییر ذخیره‌نشده دارید.</span>}
        {done && <span className="small" style={{ color: 'var(--green)' }}>
          قیمت همه محصولات بروز شد.
        </span>}
      </div>
    </div>
  );
}
