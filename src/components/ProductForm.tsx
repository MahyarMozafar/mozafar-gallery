'use client';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

const FA = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => FA[+d]);
const money = (n: number) => toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));

interface Cat { id: number; slug: string; name_fa: string }
interface Rates { gram18: number; gram21: number; gram24: number }
interface Cfg { profitPercent: number; vatPercent: number; defaultOjrat: number; barFee: number; coinProfit: number }

export function ProductForm({
  cats, rates, cfg, initial, productId,
}: {
  cats: Cat[]; rates: Rates; cfg: Cfg;
  initial?: Record<string, any>; productId?: number;
}) {
  const [f, setF] = useState<Record<string, any>>(initial ?? {
    name_fa: '', type: 'JEWELRY', category_id: cats[0]?.id ?? 1, audience: 'WOMEN',
    karat: 18, weight_grams: '', size_label: '', color: 'YELLOW', stone: '',
    ojrat_percent: cfg.defaultOjrat, fixed_price: '', coin_market: '',
    description_fa: '', stock: 1, featured: 0, sku: '', slug: '',
  });
  const [image, setImage] = useState<string>(initial?.image ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const set = (k: string) => (e: any) => {
    const v = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setF((o) => ({ ...o, [k]: v })); setErr(''); setMsg('');
  };

  // پیش‌نمایش زنده قیمت — همان فرمولی که سرور استفاده می‌کند
  const price = useMemo(() => {
    const w = parseFloat(String(f.weight_grams)) || 0;
    const k = Number(f.karat) || 18;
    const rate = k === 18 ? rates.gram18 : k === 21 ? rates.gram21 : rates.gram24;

    if (f.type === 'SILVER') {
      const t = Number(f.fixed_price) || 0;
      return { gold: t, wage: 0, profit: 0, vat: 0, total: t, rate: 0 };
    }
    if (f.type === 'COIN') {
      const m = Number(f.coin_market) || 0;
      const profit = Math.round(m * cfg.coinProfit / 100);
      return { gold: m, wage: 0, profit, vat: 0, total: m + profit, rate: 0 };
    }
    const gold = Math.round(w * rate);
    const pct = f.ojrat_percent === '' || f.ojrat_percent == null
      ? (f.type === 'BAR' ? cfg.barFee : cfg.defaultOjrat)
      : Number(f.ojrat_percent);
    const wage = Math.round(gold * pct / 100);
    const profit = f.type === 'BAR' ? 0 : Math.round((gold + wage) * cfg.profitPercent / 100);
    const vat = Math.round((wage + profit) * cfg.vatPercent / 100);
    return { gold, wage, profit, vat, total: gold + wage + profit + vat, rate };
  }, [f, rates, cfg]);

  async function upload(file: File) {
    setBusy(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setBusy(false);
    if (d.ok) setImage(d.url); else setErr(d.error ?? 'آپلود نشد');
  }

  async function save() {
    setBusy(true); setErr(''); setMsg('');
    const r = await fetch('/api/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: productId ? 'update' : 'create',
        id: productId, data: f, image,
      }),
    });
    const d = await r.json();
    setBusy(false);
    if (!d.ok) { setErr(d.error ?? 'ذخیره نشد'); return; }
    setMsg(productId ? 'تغییرات ذخیره شد.' : 'محصول ساخته شد.');
    router.refresh();
    if (!productId) setTimeout(() => router.push('/admin/products'), 700);
  }

  async function remove() {
    if (!productId) return;
    if (!confirm('این محصول حذف شود؟ برگشت ندارد.')) return;
    setBusy(true);
    await fetch('/api/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: productId }),
    });
    router.push('/admin/products'); router.refresh();
  }

  const isJewel = f.type === 'JEWELRY' || f.type === 'BAR';

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0,2fr) minmax(250px,1fr)' }}>
      <div className="stack" style={{ gap: '1.5rem' }}>
        <section>
          <h2 style={{ fontSize: '1rem' }}>اطلاعات اصلی</h2>
          <div className="form-grid">
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>نام محصول *</span>
              <input value={f.name_fa} onChange={set('name_fa')} placeholder="مثلاً: انگشتر تک‌نگین کلاسیک" />
            </label>
            <label className="field">
              <span>نوع</span>
              <select value={f.type} onChange={set('type')}>
                <option value="JEWELRY">زیورآلات طلا</option>
                <option value="COIN">سکه</option>
                <option value="BAR">شمش</option>
                <option value="SILVER">نقره / نگین (قیمت ثابت)</option>
              </select>
            </label>
            <label className="field">
              <span>دسته‌بندی</span>
              <select value={f.category_id} onChange={set('category_id')}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name_fa}</option>)}
              </select>
            </label>
            <label className="field">
              <span>مناسب برای</span>
              <select value={f.audience} onChange={set('audience')}>
                <option value="WOMEN">زنانه</option>
                <option value="MEN">مردانه</option>
                <option value="KIDS">بچگانه</option>
                <option value="ALL">همه</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem' }}>مشخصات و قیمت</h2>
          <div className="form-grid">
            {isJewel && (
              <>
                <label className="field">
                  <span>وزن (گرم) *</span>
                  <input value={f.weight_grams} onChange={set('weight_grams')} inputMode="decimal" placeholder="3.245" />
                </label>
                <label className="field">
                  <span>عیار</span>
                  <select value={f.karat} onChange={set('karat')}>
                    <option value={18}>۱۸ عیار</option>
                    <option value={21}>۲۱ عیار</option>
                    <option value={24}>۲۴ عیار</option>
                  </select>
                </label>
                <label className="field">
                  <span>{f.type === 'BAR' ? 'کارمزد (٪)' : 'اجرت (٪)'}</span>
                  <input value={f.ojrat_percent ?? ''} onChange={set('ojrat_percent')} inputMode="decimal" />
                </label>
              </>
            )}
            {f.type === 'COIN' && (
              <label className="field">
                <span>نرخ بازار سکه (تومان) *</span>
                <input value={f.coin_market ?? ''} onChange={set('coin_market')} inputMode="numeric" />
              </label>
            )}
            {f.type === 'SILVER' && (
              <label className="field">
                <span>قیمت ثابت (تومان) *</span>
                <input value={f.fixed_price ?? ''} onChange={set('fixed_price')} inputMode="numeric" />
              </label>
            )}
            <label className="field">
              <span>اندازه</span>
              <input value={f.size_label ?? ''} onChange={set('size_label')} placeholder="سایز ۵۴ / طول ۴۵ سانتی‌متر" />
            </label>
            {isJewel && (
              <label className="field">
                <span>رنگ طلا</span>
                <select value={f.color ?? 'YELLOW'} onChange={set('color')}>
                  <option value="YELLOW">زرد</option>
                  <option value="WHITE">سفید</option>
                  <option value="ROSE">رزگلد</option>
                </select>
              </label>
            )}
            <label className="field">
              <span>نگین</span>
              <input value={f.stone ?? ''} onChange={set('stone')} placeholder="زیرکونیا / بدون نگین" />
            </label>
            <label className="field">
              <span>موجودی</span>
              <input value={f.stock ?? 1} onChange={set('stock')} inputMode="numeric" />
            </label>
          </div>
          <label className="field" style={{ marginBlockStart: '1rem' }}>
            <span>توضیح</span>
            <textarea rows={3} value={f.description_fa ?? ''} onChange={set('description_fa')} />
          </label>
          <label className="row" style={{ marginBlockStart: '.8rem', gap: '.5rem' }}>
            <input type="checkbox" checked={!!Number(f.featured)} onChange={set('featured')} />
            <span className="small">در صفحه اصلی نشان داده شود</span>
          </label>
        </section>

        <section>
          <h2 style={{ fontSize: '1rem' }}>عکس</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false);
              const file = e.dataTransfer.files?.[0];
              if (file) upload(file);
            }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? 'var(--gold)' : 'var(--hairline-2)'}`,
              borderRadius: 'var(--radius)', padding: image ? '.8rem' : '2rem',
              textAlign: 'center', cursor: 'pointer',
              background: drag ? 'var(--gold-soft)' : 'var(--bg-soft)',
            }}>
            {image ? (
              <div className="row" style={{ justifyContent: 'center', gap: '1rem' }}>
                <img src={image} alt="" width={110} height={110}
                     style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <span className="small muted">برای عوض کردن، عکس تازه بکشید اینجا یا کلیک کنید</span>
              </div>
            ) : (
              <p className="muted small" style={{ margin: 0 }}>
                عکس را بکشید اینجا، یا کلیک کنید.<br />
                <span style={{ fontSize: '.78rem' }}>JPG، PNG، WebP یا AVIF — تا ۶ مگابایت</span>
              </p>
            )}
          </div>
          <input ref={fileRef} type="file" hidden accept="image/*"
                 onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </section>

        <div className="row">
          <button className="btn btn--gold" onClick={save} disabled={busy || !f.name_fa}>
            {busy ? 'صبر کنید…' : productId ? 'ذخیره تغییرات' : 'ساخت محصول'}
          </button>
          {productId && (
            <button className="btn" onClick={remove} disabled={busy}
                    style={{ color: 'var(--red)', borderColor: '#F0C4C1' }}>
              حذف محصول
            </button>
          )}
          {msg && <span className="small" style={{ color: 'var(--green)' }}>{msg}</span>}
          {err && <span className="small" style={{ color: 'var(--red)' }}>{err}</span>}
        </div>
      </div>

      <aside>
        <div className="tile tile--gold" style={{ marginBlockEnd: '1rem' }}>
          <p className="tile__label">قیمت این محصول</p>
          <p className="tile__value num">{money(price.total)}</p>
          <p className="tile__note">تومان — با نرخ همین لحظه</p>
        </div>
        <dl className="breakdown">
          {price.rate > 0 && (
            <div className="breakdown__row"><dt>نرخ گرم</dt><dd className="num">{money(price.rate)}</dd></div>
          )}
          <div className="breakdown__row">
            <dt>{f.type === 'COIN' ? 'نرخ بازار' : f.type === 'SILVER' ? 'قیمت ثابت' : 'ارزش طلا'}</dt>
            <dd className="num">{money(price.gold)}</dd>
          </div>
          {price.wage > 0 && (
            <div className="breakdown__row">
              <dt>{f.type === 'BAR' ? 'کارمزد' : 'اجرت'}</dt><dd className="num">{money(price.wage)}</dd>
            </div>
          )}
          {price.profit > 0 && (
            <div className="breakdown__row"><dt>سود</dt><dd className="num">{money(price.profit)}</dd></div>
          )}
          {price.vat > 0 && (
            <div className="breakdown__row"><dt>مالیات</dt><dd className="num">{money(price.vat)}</dd></div>
          )}
        </dl>
        <p className="small muted" style={{ marginBlockStart: '.7rem' }}>
          قیمت همین‌جا و بدون ذخیره کردن عوض می‌شود، تا قبل از ساخت ببینید چه می‌شود.
        </p>
      </aside>
    </div>
  );
}
