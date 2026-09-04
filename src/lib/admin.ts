/** آمار و عملیات پنل مدیریت. */
import 'server-only';
import { db, migrate } from './db/index.ts';
import { allProducts } from './shop.ts';

export function dashboardStats() {
  migrate();
  const d = db();
  const products = allProducts();

  const one = (sql: string, ...a: any[]) => (d.prepare(sql).get(...a) as any) ?? {};

  const stockValue = products
    .filter((p) => p.stock > 0)
    .reduce((n, p) => n + p.price.total, 0);

  const totalWeight = products
    .filter((p) => p.stock > 0 && p.weightGrams)
    .reduce((n, p) => n + (p.weightGrams ?? 0), 0);

  return {
    productCount:  products.length,
    inStock:       products.filter((p) => p.stock > 0).length,
    soldOut:       products.filter((p) => p.stock < 1).length,
    stockValue,
    totalWeight,
    orders:        one('SELECT COUNT(*) c FROM orders').c ?? 0,
    awaiting:      one("SELECT COUNT(*) c FROM orders WHERE status='AWAITING_PAYMENT'").c ?? 0,
    pendingReceipts: one("SELECT COUNT(*) c FROM payment_receipts WHERE status='PENDING'").c ?? 0,
    salesTotal:    one("SELECT COALESCE(SUM(total),0) s FROM orders WHERE status IN ('PAID','SHIPPED','DELIVERED')").s ?? 0,
  };
}

export function adminProducts() {
  return allProducts();
}

export function adminOrders() {
  migrate();
  return db().prepare(`
    SELECT o.*, u.phone, u.name AS user_name,
           (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count,
           (SELECT status FROM payment_receipts r WHERE r.order_id = o.id ORDER BY id DESC LIMIT 1) AS receipt_status
    FROM orders o LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC`).all() as any[];
}
