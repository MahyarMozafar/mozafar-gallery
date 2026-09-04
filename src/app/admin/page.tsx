import Link from 'next/link';
import { dashboardStats } from '@/lib/admin.ts';
import { goldRates, settings } from '@/lib/shop.ts';
import { faMoney, faWeight, toFa, faDateTime, faPercent } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

export default function AdminHome() {
  const s = dashboardStats();
  const r = goldRates();
  const cfg = settings();

  return (
    <>
      <h1 style={{ fontSize: '1.5rem' }}>داشبورد</h1>
      <p className="muted small" style={{ marginBlockEnd: '1.5rem' }}>
        نرخ فعلی طلای ۱۸ عیار: <b className="num">{faMoney(r.gram18)} تومان</b>
        {' '}· منبع: {r.source === 'manual' ? 'دستی' : r.source}
        {' '}· بروزرسانی: {faDateTime(r.fetchedAt)}
      </p>

      <div className="tiles">
        <div className="tile tile--gold">
          <p className="tile__label">ارزش کل موجودی</p>
          <p className="tile__value num">{faMoney(s.stockValue)}</p>
          <p className="tile__note">تومان — با نرخ همین لحظه</p>
        </div>
        <div className="tile">
          <p className="tile__label">وزن کل طلای موجود</p>
          <p className="tile__value num">{faWeight(s.totalWeight, 2)}</p>
          <p className="tile__note">گرم</p>
        </div>
        <div className="tile">
          <p className="tile__label">محصولات</p>
          <p className="tile__value num">{toFa(s.productCount)}</p>
          <p className="tile__note">{toFa(s.inStock)} موجود · {toFa(s.soldOut)} فروخته‌شده</p>
        </div>
        <div className={`tile${s.pendingReceipts ? ' tile--warn' : ''}`}>
          <p className="tile__label">رسیدهای در انتظار تأیید</p>
          <p className="tile__value num">{toFa(s.pendingReceipts)}</p>
          <p className="tile__note">نیاز به بررسی شما</p>
        </div>
        <div className="tile">
          <p className="tile__label">سفارش‌ها</p>
          <p className="tile__value num">{toFa(s.orders)}</p>
          <p className="tile__note">{toFa(s.awaiting)} در انتظار پرداخت</p>
        </div>
        <div className="tile">
          <p className="tile__label">فروش تأییدشده</p>
          <p className="tile__value num">{faMoney(s.salesTotal)}</p>
          <p className="tile__note">تومان</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBlockStart: '2.2rem' }}>تنظیمات فعلی</h2>
      <div className="tiles">
        <div className="tile">
          <p className="tile__label">سود فروشنده</p>
          <p className="tile__value num">{faPercent(cfg.profitPercent)}</p>
        </div>
        <div className="tile">
          <p className="tile__label">مالیات ارزش افزوده</p>
          <p className="tile__value num">{faPercent(cfg.vatPercent)}</p>
        </div>
        <div className="tile">
          <p className="tile__label">اجرت پیش‌فرض</p>
          <p className="tile__value num">{faPercent(cfg.defaultOjratPercent)}</p>
        </div>
        <div className="tile">
          <p className="tile__label">نرخ خرید از مشتری (۷۴۰)</p>
          <p className="tile__value num" style={{ fontSize: '1.15rem' }}>{faMoney(r.gram740)}</p>
          <p className="tile__note">تومان بر گرم</p>
        </div>
      </div>

      <div className="row" style={{ marginBlockStart: '1.8rem' }}>
        <Link href="/admin/products" className="btn">مدیریت محصولات</Link>
        <Link href="/admin/settings" className="btn btn--gold">تغییر نرخ و تنظیمات</Link>
      </div>
    </>
  );
}
