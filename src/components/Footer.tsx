import Link from 'next/link';
import { shopInfo } from '@/lib/shop.ts';
import { toFa } from '@/lib/format/fa.ts';

export function Footer() {
  const s = shopInfo();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <h4>گالری مظفر</h4>
            <p className="muted small">
              خرید آنلاین طلا و جواهر با قیمت روز، فاکتور رسمی و ضمانت اصالت.
            </p>
          </div>
          <div>
            <h4>فروشگاه</h4>
            <Link href="/shop">همه محصولات</Link>
            <Link href="/shop?cat=ring">انگشتر و حلقه</Link>
            <Link href="/shop?cat=necklace">گردنبند</Link>
            <Link href="/shop?type=COIN">سکه</Link>
            <Link href="/shop?type=BAR">شمش</Link>
          </div>
          <div>
            <h4>راهنما</h4>
            <Link href="/calculator">ماشین‌حساب قیمت طلا</Link>
            <Link href="/blog">مجله</Link>
            <Link href="/about">درباره ما</Link>
            <Link href="/contact">تماس با ما</Link>
          </div>
          <div>
            <h4>تماس</h4>
            <p className="muted small num" style={{ direction: 'ltr', textAlign: 'right' }}>{s.phone}</p>
            <p className="muted small">{s.address}</p>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {toFa(1405)} گالری مظفر</span>
          <span>نمونه‌کار — قیمت‌ها آزمایشی است</span>
        </div>
      </div>
    </footer>
  );
}
