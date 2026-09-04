'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RemoveFromCart({ productId }: { productId: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button className="btn" disabled={busy} style={{ padding: '.4rem .7rem', fontSize: '.8rem' }}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/cart', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ productId, action: 'remove' }),
        });
        router.refresh(); setBusy(false);
      }}>
      حذف
    </button>
  );
}
