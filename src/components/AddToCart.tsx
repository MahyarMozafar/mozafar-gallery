'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddToCart({ productId, disabled }: { productId: number; disabled?: boolean }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function add() {
    setState('busy');
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, action: 'add' }),
    });
    const data = await res.json();
    if (data.ok) { setState('done'); router.refresh(); }
    else { setState('err'); setMsg(data.error ?? 'خطا'); }
  }

  if (disabled) {
    return <button className="btn btn--block" disabled>این قطعه فروخته شده است</button>;
  }

  return (
    <div className="stack" style={{ gap: '.5rem' }}>
      <button className="btn btn--gold btn--block" onClick={add} disabled={state === 'busy'}>
        {state === 'busy' ? 'در حال افزودن…' : state === 'done' ? '✓ به سبد اضافه شد' : 'افزودن به سبد خرید'}
      </button>
      {state === 'done' && (
        <a href="/cart" className="btn btn--block">رفتن به سبد خرید</a>
      )}
      {state === 'err' && <p className="small" style={{ color: 'var(--red)' }}>{msg}</p>}
      <p className="small muted center">
        افزودن به سبد، قطعه را رزرو نمی‌کند. رزرو موقع ثبت سفارش انجام می‌شود.
      </p>
    </div>
  );
}
