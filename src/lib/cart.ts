/**
 * سبد خرید.
 *
 * دو قانون مهم:
 *  ۱) مهمان هم سبد دارد — برای دیدن و اضافه کردن، ورود لازم نیست.
 *  ۲) اضافه کردن به سبد، موجودی را رزرو نمی‌کند.
 *     چرا؟ چون سبد برای همه باز است. اگر قفل می‌کرد، یک نفر بدون حتی
 *     ورود می‌توانست در یک دقیقه کل موجودی مغازه را ببندد.
 *     رزرو فقط موقع «ثبت سفارش» انجام می‌شود.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { db, migrate } from './db/index.ts';
import { productsByIds, type Product } from './shop.ts';

const COOKIE = 'mg_cart';

/** شناسه سبد را از کوکی می‌گیرد (اگر نبود، نمی‌سازد — فقط می‌خواند). */
export async function cartIdFromCookie(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value ?? null;
}

/** محصول‌های داخل سبد. */
export async function cartItems(): Promise<Product[]> {
  migrate();
  const id = await cartIdFromCookie();
  if (!id) return [];
  const rows = db()
    .prepare('SELECT product_id FROM cart_items WHERE cart_id = ? ORDER BY added_at')
    .all(id) as { product_id: number }[];
  const ids = rows.map((r) => r.product_id);
  const found = productsByIds(ids);
  // ترتیب اضافه شدن را نگه می‌داریم
  return ids.map((i) => found.find((p) => p.id === i)).filter(Boolean) as Product[];
}

export async function cartCount(): Promise<number> {
  const id = await cartIdFromCookie();
  if (!id) return 0;
  migrate();
  const r = db().prepare('SELECT COUNT(*) c FROM cart_items WHERE cart_id = ?').get(id) as any;
  return r?.c ?? 0;
}
