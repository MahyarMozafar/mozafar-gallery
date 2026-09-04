import Link from 'next/link';
import './admin.css';

export const metadata = { title: 'پنل مدیریت | گالری مظفر' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <aside className="admin__side">
        <p className="admin__brand">گالری مظفر</p>
        <p className="admin__sub">پنل مدیریت</p>
        <nav className="admin__nav">
          <Link href="/admin">داشبورد</Link>
          <Link href="/admin/products">محصولات</Link>
          <Link href="/admin/orders">سفارش‌ها</Link>
          <Link href="/admin/settings">تنظیمات</Link>
          <Link href="/" style={{ marginBlockStart: '1rem' }}>← بازگشت به سایت</Link>
        </nav>
      </aside>
      <main className="admin__main">{children}</main>
    </div>
  );
}
