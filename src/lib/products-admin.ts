/** ساخت، ویرایش و حذف محصول از پنل مدیریت. */
import 'server-only';
import { db, migrate, plain, plainAll } from './db/index.ts';
import { clearRateCache } from './shop.ts';

/** فقط این ستون‌ها اجازه نوشتن دارند.
 *  اسم ستون را نمی‌شود به شکل پارامتر به SQL داد، پس با لیست سفید محدودش می‌کنیم. */
const WRITABLE = new Set([
  'slug', 'sku', 'name_fa', 'type', 'category_id', 'audience', 'karat',
  'weight_grams', 'size_label', 'color', 'stone', 'ojrat_percent',
  'profit_percent', 'fixed_price', 'coin_market', 'brand',
  'description_fa', 'stock', 'featured', 'status',
]);

export interface ProductInput { [k: string]: any }

function clean(input: ProductInput): ProductInput {
  const out: ProductInput = {};
  for (const [k, v] of Object.entries(input)) {
    if (!WRITABLE.has(k)) continue;
    if (v === '' || v === undefined) { out[k] = null; continue; }
    out[k] = v;
  }
  return out;
}

/** اسم فارسی را به نشانی انگلیسی تبدیل می‌کند. */
export function makeSlug(name: string, fallback: string): string {
  const s = name.trim().replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase();
  return s || fallback;
}

export function createProduct(input: ProductInput): { id: number } {
  migrate();
  const d = clean(input);
  if (!d.name_fa) throw new Error('نام محصول لازم است.');

  const stamp = Date.now().toString(36);
  d.slug = d.slug || makeSlug(String(d.name_fa), `p-${stamp}`);
  d.sku  = d.sku  || `MG-${stamp.toUpperCase()}`;
  d.stock = d.stock ?? 1;
  d.status = d.status ?? 'ACTIVE';
  d.featured = d.featured ?? 0;

  const cols = Object.keys(d);
  const sql = `INSERT INTO products (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
  db().prepare(sql).run(...cols.map((c) => d[c]));

  const row = db().prepare('SELECT id FROM products WHERE slug = ?').get(d.slug) as any;
  clearRateCache();
  return { id: row.id };
}

export function updateProduct(id: number, input: ProductInput): void {
  migrate();
  const d = clean(input);
  const cols = Object.keys(d);
  if (!cols.length) return;
  const sql = `UPDATE products SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`;
  db().prepare(sql).run(...cols.map((c) => d[c]), id);
  clearRateCache();
}

export function deleteProduct(id: number): void {
  migrate();
  db().prepare('DELETE FROM products WHERE id = ?').run(id);
  clearRateCache();
}

export function setProductImage(productId: number, url: string, alt: string): void {
  migrate();
  const d = db();
  d.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
  d.prepare('INSERT INTO product_images (product_id, url, alt_fa, sort) VALUES (?,?,?,0)')
    .run(productId, url, alt);
}

export function rawProduct(id: number) {
  migrate();
  return plain<any>(db().prepare(`
    SELECT p.*, (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort LIMIT 1) AS image
    FROM products p WHERE p.id = ?`).get(id));
}

export function categoryList() {
  migrate();
  return plainAll<any>(db().prepare('SELECT id, slug, name_fa FROM categories ORDER BY sort').all());
}
