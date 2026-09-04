/** افزودن و حذف از سبد. موجودی را دست نمی‌زند — فقط لیست است. */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, migrate } from '@/lib/db/index.ts';
import { randomUUID } from 'node:crypto';

const COOKIE = 'mg_cart';

export async function POST(req: Request) {
  migrate();
  const { productId, action } = await req.json();
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ ok: false, error: 'شناسه نامعتبر' }, { status: 400 });
  }

  const jar = await cookies();
  let cartId = jar.get(COOKIE)?.value;
  if (!cartId) {
    cartId = randomUUID();
    jar.set(COOKIE, cartId, {
      httpOnly: true, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const database = db();
  database.prepare('INSERT OR IGNORE INTO carts (id) VALUES (?)').run(cartId);

  if (action === 'remove') {
    database.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?')
      .run(cartId, productId);
  } else {
    // فقط اگر محصول واقعاً موجود باشد
    const p = database.prepare("SELECT stock FROM products WHERE id = ? AND status='ACTIVE'")
      .get(productId) as any;
    if (!p) return NextResponse.json({ ok: false, error: 'محصول پیدا نشد' }, { status: 404 });
    if (p.stock < 1) return NextResponse.json({ ok: false, error: 'این قطعه فروخته شده' }, { status: 409 });
    database.prepare('INSERT OR IGNORE INTO cart_items (cart_id, product_id) VALUES (?,?)')
      .run(cartId, productId);
  }

  const c = database.prepare('SELECT COUNT(*) c FROM cart_items WHERE cart_id = ?')
    .get(cartId) as any;
  return NextResponse.json({ ok: true, count: c.c });
}
