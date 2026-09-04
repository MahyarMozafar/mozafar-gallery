'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface L { href: string; label: string }

export function MobileMenu({
  links, accountHref, accountLabel,
}: { links: L[]; accountHref: string; accountLabel: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  // با عوض شدن صفحه، منو بسته شود
  useEffect(() => { setOpen(false); }, [path]);

  // وقتی منو باز است، پشتش اسکرول نشود
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // با Escape بسته شود
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        className="burger"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`burger__box${open ? ' is-open' : ''}`}>
          <i /><i /><i />
        </span>
      </button>

      <div className={`drawer${open ? ' is-open' : ''}`} onClick={() => setOpen(false)}>
        <nav className="drawer__panel" onClick={(e) => e.stopPropagation()}>
          <p className="drawer__title">منو</p>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="drawer__link">{l.label}</Link>
          ))}
          <hr className="drawer__rule" />
          <Link href="/cart" className="drawer__link">سبد خرید</Link>
          <Link href={accountHref} className="drawer__link">{accountLabel}</Link>
          <Link href="/contact" className="drawer__link">تماس با ما</Link>
        </nav>
      </div>
    </>
  );
}
