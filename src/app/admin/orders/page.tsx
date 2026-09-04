import { adminOrders } from '@/lib/admin.ts';
import { faMoney, toFa } from '@/lib/format/fa.ts';

export const dynamic = 'force-dynamic';

const STATUS_FA: Record<string, string> = {
  AWAITING_PAYMENT: 'در انتظار پرداخت',
  RECEIPT_UPLOADED: 'رسید آپلود شد',
  PAID: 'پرداخت‌شده',
  SHIPPED: 'ارسال‌شده',
  READY_FOR_PICKUP: 'آماده تحویل',
  DELIVERED: 'تحویل‌شده',
  CANCELLED: 'لغو شده',
};

export default function AdminOrders() {
  const orders = adminOrders();

  return (
    <>
      <h1 style={{ fontSize: '1.5rem' }}>سفارش‌ها</h1>

      {orders.length === 0 ? (
        <div className="notice" style={{ marginBlockStart: '1rem' }}>
          هنوز سفارشی ثبت نشده است. وقتی مشتری «ثبت سفارش» بزند، اینجا می‌آید و
          می‌توانید رسید کارت به کارت را تأیید یا رد کنید.
        </div>
      ) : (
        <div className="table-scroll" style={{ marginBlockStart: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>کد</th><th>مشتری</th><th>موبایل</th><th>اقلام</th>
                <th>مبلغ</th><th>وضعیت</th><th>رسید</th><th>تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="num">{o.code}</td>
                  <td>{o.user_name ?? '—'}</td>
                  <td className="num">{o.phone ?? '—'}</td>
                  <td className="num">{toFa(o.item_count)}</td>
                  <td className="num">{faMoney(o.total)}</td>
                  <td>{STATUS_FA[o.status] ?? o.status}</td>
                  <td>
                    {o.receipt_status === 'PENDING'   && <span className="pill">در انتظار</span>}
                    {o.receipt_status === 'APPROVED'  && <span className="pill pill--ok">تأیید</span>}
                    {o.receipt_status === 'REJECTED'  && <span className="pill pill--out">رد</span>}
                    {!o.receipt_status && '—'}
                  </td>
                  <td className="num">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
