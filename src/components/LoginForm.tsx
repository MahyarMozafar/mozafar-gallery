'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ returnTo = '/account' }: { returnTo?: string }) {
  const [step, setStep]   = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode]   = useState('');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');
  const [devCode, setDev] = useState('');
  const router = useRouter();

  const field: React.CSSProperties = {
    width: '100%', padding: '.78rem .9rem', fontSize: '1rem',
    border: '1px solid var(--hairline-2)', borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit', direction: 'ltr', textAlign: 'right', background: '#fff',
  };

  async function send() {
    setBusy(true); setErr('');
    const r = await fetch('/api/auth/request', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { setStep('code'); setDev(d.devCode ?? ''); }
    else setErr(d.error ?? 'خطا در ارسال کد');
  }

  async function verify() {
    setBusy(true); setErr('');
    const r = await fetch('/api/auth/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const d = await r.json();
    setBusy(false);
    if (d.ok) { router.push(returnTo); router.refresh(); }
    else setErr(d.error ?? 'کد درست نیست');
  }

  return (
    <div className="stack" style={{ gap: '.9rem' }}>
      {step === 'phone' ? (
        <>
          <label className="field">
            <span>شماره موبایل</span>
            <input style={field} value={phone} inputMode="numeric" placeholder="09121234567"
                   autoFocus
                   onChange={(e) => { setPhone(e.target.value); setErr(''); }}
                   onKeyDown={(e) => e.key === 'Enter' && send()} />
          </label>
          <button className="btn btn--gold btn--block" onClick={send}
                  disabled={busy || phone.replace(/\D/g, '').length < 10}>
            {busy ? 'در حال ارسال…' : 'دریافت کد'}
          </button>
        </>
      ) : (
        <>
          <p className="small muted" style={{ margin: 0 }}>
            کد به <b className="num" style={{ direction: 'ltr', display: 'inline-block' }}>{phone}</b> فرستاده شد.
          </p>
          <label className="field">
            <span>کد پنج‌رقمی</span>
            <input style={{ ...field, letterSpacing: '.5em', textAlign: 'center', fontSize: '1.3rem' }}
                   value={code} inputMode="numeric" maxLength={5} autoFocus
                   onChange={(e) => { setCode(e.target.value); setErr(''); }}
                   onKeyDown={(e) => e.key === 'Enter' && code.length === 5 && verify()} />
          </label>
          <button className="btn btn--gold btn--block" onClick={verify}
                  disabled={busy || code.replace(/\D/g, '').length < 5}>
            {busy ? 'در حال بررسی…' : 'ورود'}
          </button>
          <button className="btn btn--block"
                  onClick={() => { setStep('phone'); setCode(''); setErr(''); setDev(''); }}>
            تغییر شماره
          </button>
        </>
      )}

      {err && (
        <p className="small" style={{
          color: 'var(--red)', background: '#FBE9E8', border: '1px solid #F0C4C1',
          borderRadius: 'var(--radius-sm)', padding: '.55rem .8rem', margin: 0,
        }}>{err}</p>
      )}

      {devCode && (
        <div className="notice">
          <b>حالت ساخت:</b> پیامک واقعی فرستاده نشد.
          کد شما: <b className="num" style={{ fontSize: '1.1rem' }}>{devCode}</b>
          <br />
          <span className="small">
            وقتی کلید کاوه‌نگار را بگیریم، این کادر می‌رود و کد واقعاً پیامک می‌شود.
          </span>
        </div>
      )}
    </div>
  );
}
