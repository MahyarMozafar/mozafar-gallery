'use client';
import { useState } from 'react';

export function LoginForm() {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const field: React.CSSProperties = {
    width: '100%', padding: '.75rem .9rem', fontSize: '1rem',
    border: '1px solid var(--hairline-2)', borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit', direction: 'ltr', textAlign: 'right',
  };

  return (
    <div className="stack" style={{ gap: '.9rem' }}>
      {step === 'phone' ? (
        <>
          <label className="field">
            <span>شماره موبایل</span>
            <input style={field} value={phone} inputMode="numeric" placeholder="09xxxxxxxxx"
                   onChange={(e) => setPhone(e.target.value)} />
          </label>
          <button className="btn btn--gold btn--block"
                  disabled={phone.replace(/\D/g, '').length < 11}
                  onClick={() => setStep('code')}>
            دریافت کد
          </button>
        </>
      ) : (
        <>
          <label className="field">
            <span>کد پیامک‌شده</span>
            <input style={{ ...field, letterSpacing: '.4em', textAlign: 'center' }}
                   value={code} inputMode="numeric" maxLength={5}
                   onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="btn btn--gold btn--block" disabled={code.length < 5}>
            ورود
          </button>
          <button className="btn btn--block" onClick={() => setStep('phone')}>
            تغییر شماره
          </button>
        </>
      )}
      <div className="notice">
        <b>در دست ساخت.</b> ورود با پیامک در مرحله بعدی وصل می‌شود.
        تا آن موقع می‌توانید بدون حساب، سایت را ببینید و سبد خرید بسازید.
      </div>
    </div>
  );
}
