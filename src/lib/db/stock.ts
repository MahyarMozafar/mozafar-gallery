/**
 * قفل کردن موجودی — حل مشکل «دو نفر یک انگشتر را همزمان می‌خرند».
 *
 * روش غلط:
 *    ۱) موجودی را بخوان    → ۱
 *    ۲) چک کن بزرگ‌تر از صفر است؟ → بله
 *    ۳) بنویس صفر
 * اگر دو نفر دقیقاً هم‌زمان این کار را بکنند، هر دو در مرحله ۱ عدد «۱» را می‌بینند،
 * هر دو از مرحله ۲ رد می‌شوند، و یک انگشتر دو بار فروخته می‌شود.
 *
 * روش درست: در «یک دستور» هم شرط و هم تغییر را با هم بده و بگذار
 * خود پایگاه داده تصمیم بگیرد. پایگاه داده تضمین می‌کند فقط یکی برنده شود.
 */
import { db } from './index.ts';

export class OutOfStockError extends Error {
  constructor(public productId: number) {
    super('این قطعه موجود نیست');
    this.name = 'OutOfStockError';
  }
}

/**
 * یک عدد از موجودی کم می‌کند — به شکل اتمی.
 * اگر موجودی نباشد، هیچ سطری عوض نمی‌شود و false برمی‌گردد.
 */
export function claimOne(productId: number): boolean {
  const res = db()
    .prepare('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock >= 1')
    .run(productId);
  return res.changes === 1;   // ← فقط یکی می‌تواند ۱ بگیرد
}

/** موجودی را برمی‌گرداند (مثلاً وقتی رزرو منقضی شد). */
export function releaseOne(productId: number): void {
  db().prepare('UPDATE products SET stock = stock + 1 WHERE id = ?').run(productId);
}

/**
 * چند قطعه را با هم برمی‌دارد.
 * هر کدام که فروخته شده باشد، جدا گزارش می‌شود — بی‌سروصدا حذف نمی‌شود.
 */
export function claimMany(productIds: number[]): {
  claimed: number[];
  soldOut: number[];
} {
  const claimed: number[] = [];
  const soldOut: number[] = [];
  const database = db();
  database.exec('BEGIN IMMEDIATE');
  try {
    for (const id of productIds) {
      if (claimOne(id)) claimed.push(id);
      else soldOut.push(id);
    }
    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
  return { claimed, soldOut };
}

/** رزروهای منقضی‌شده را آزاد می‌کند. این را یک کار زمان‌بندی‌شده صدا می‌زند. */
export function releaseExpiredReservations(): number {
  const database = db();
  const expired = database
    .prepare("SELECT id, product_id FROM stock_reservations WHERE expires_at < datetime('now')")
    .all() as { id: number; product_id: number }[];

  database.exec('BEGIN IMMEDIATE');
  try {
    for (const r of expired) {
      releaseOne(r.product_id);
      database.prepare('DELETE FROM stock_reservations WHERE id = ?').run(r.id);
    }
    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
  return expired.length;
}
