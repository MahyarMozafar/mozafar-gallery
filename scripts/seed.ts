/**
 * پایگاه داده را می‌سازد و با محصول‌های نمونه پر می‌کند.
 * اجرا:  npm run seed
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
mkdirSync(join(root, 'data'), { recursive: true });

const db = new DatabaseSync(join(root, 'data', 'shop.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(readFileSync(join(root, 'src/lib/db/schema.sql'), 'utf8'));

// پاک کردن داده قبلی تا هر بار از نو ساخته شود
for (const t of ['product_images','cart_items','order_items','stock_reservations',
                 'payment_receipts','wishlist','orders','carts','products',
                 'categories','settings','gold_price_snapshots','posts','users']) {
  db.exec(`DELETE FROM ${t}`);
}

// ---------- تنظیمات مغازه ----------
const settings: Record<string, string> = {
  shopName:            'گالری مظفر',
  profitPercent:       '7',      // سقف اتحادیه
  vatPercent:          '10',     // ۱۴۰۴/۱۴۰۵
  defaultOjratPercent: '12',
  barFeePercent:       '1.5',
  coinProfitPercent:   '2',
  priceAdjustment:     '0',      // ± درصد روی نرخ خام
  goldProvider:        'manual',
  manualGram18:        '22000000',   // ← نرخ نمایشی که مهیار خواست
  changePercent:       '0.45',
  reservationMinutes:  '5',
  paymentWindowMinutes:'30',
  shippingToman:       '450000',
  // شماره کارت ساختگی برای نمونه. شماره واقعی را از پنل مدیریت وارد کنید،
  // نه اینجا — این فایل داخل گیت است.
  shopCardNumber:      '6037-9975-1234-5678',
  shopCardHolder:      'مهیار مظفر',
  shopPhone:           '021-88000000',
  shopAddress:         'تهران، خیابان نمونه، پلاک ۱',
};
const sIns = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(settings)) sIns.run(k, v);

// ---------- دسته‌بندی‌ها ----------
const cats = [
  ['ring','انگشتر و حلقه','WOMEN',1],
  ['necklace','گردنبند و آویز','WOMEN',2],
  ['bracelet','دستبند و النگو','WOMEN',3],
  ['earring','گوشواره','WOMEN',4],
  ['anklet','پابند','WOMEN',5],
  ['set','نیم‌ست و سرویس','WOMEN',6],
  ['coin','سکه','ALL',7],
  ['bar','شمش طلا','ALL',8],
  ['silver','نقره و نگین','ALL',9],
] as const;
const cIns = db.prepare('INSERT INTO categories (slug, name_fa, audience, sort) VALUES (?,?,?,?)');
for (const [slug, name, aud, sort] of cats) cIns.run(slug, name, aud, sort);

const catId = (slug: string) =>
  (db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug) as any).id as number;

// ---------- محصول‌ها ----------
type Row = {
  slug: string; sku: string; name: string; type: string; cat: string;
  audience: string; karat: number | null; weight: number; size: string;
  color: string | null; stone: string | null; ojrat: number | null;
  coin_market?: number; fixed_price?: number; featured: number; desc: string;
};
const products: Row[] = JSON.parse(
  readFileSync(join(root, 'scripts/products.json'), 'utf8'),
);

const pIns = db.prepare(`
  INSERT INTO products
    (slug, sku, name_fa, type, category_id, audience, karat, weight_grams,
     size_label, color, stone, ojrat_percent, profit_percent, fixed_price,
     coin_market, brand, description_fa, stock, featured, status)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'ACTIVE')`);

const imgIns = db.prepare(
  'INSERT INTO product_images (product_id, url, alt_fa, sort) VALUES (?,?,?,0)');

for (const p of products) {
  pIns.run(
    p.slug, p.sku, p.name, p.type, catId(p.cat), p.audience,
    p.karat, p.weight, p.size, p.color, p.stone,
    p.ojrat, null, p.fixed_price ?? null, p.coin_market ?? null,
    'گالری مظفر', p.desc,
    1,                    // موجودی ۱ — هر قطعه تک‌نسخه است
    p.featured,
  );
  const id = (db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug) as any).id;
  imgIns.run(id, `/products/${p.slug}.jpg`, p.name);
}

// ---------- یک نرخ اولیه ----------
db.prepare(
  'INSERT INTO gold_price_snapshots (gram18, change_percent, source) VALUES (?,?,?)',
).run(22_000_000, 0.45, 'manual');

// ---------- مدیر ----------
db.prepare("INSERT INTO users (phone, name, role) VALUES (?,?,'ADMIN')")
  .run('09120000000', 'مهیار مظفر');

// ---------- چند مطلب مجله ----------
const posts = [
  ['ayar-chist','عیار طلا یعنی چه؟','فرق ۱۸ و ۲۱ و ۲۴ عیار در یک نگاه ساده.',
   'عیار یعنی چقدر از یک قطعه، طلای خالص است. طلای ۱۸ عیار یعنی از هر ۱۰۰۰ گرم، ۷۵۰ گرم طلای خالص است و بقیه فلز دیگر. هرچه عیار بالاتر باشد طلا نرم‌تر است، برای همین زیورآلات معمولاً ۱۸ عیار ساخته می‌شوند تا مقاوم‌تر باشند.'],
  ['ojrat-chist','اجرت ساخت چیست و چرا فرق می‌کند؟','چرا دو قطعه هم‌وزن، قیمت متفاوت دارند.',
   'اجرت، دستمزد ساخت قطعه است. هرچه کار ظریف‌تر و دست‌سازتر باشد، اجرت بیشتر می‌شود. برای همین دو گردنبند با وزن یکسان می‌توانند قیمت متفاوتی داشته باشند. اجرت به صورت درصدی از ارزش طلا حساب می‌شود.'],
  ['negahdari-tala','نگهداری از طلا در خانه','چند نکته ساده که طلا را نو نگه می‌دارد.',
   'طلا را دور از عطر و مواد شوینده نگه دارید. هر قطعه را جدا در پارچه نرم بگذارید تا خط نیفتد. برای تمیز کردن، آب ولرم و کمی مایع ظرفشویی ملایم کافی است. از مسواک نرم برای جاهای ریز استفاده کنید.'],
];
const postIns = db.prepare(
  "INSERT INTO posts (slug, title_fa, excerpt_fa, body_fa, published_at) VALUES (?,?,?,?,datetime('now'))");
for (const [slug, title, excerpt, body] of posts) postIns.run(slug, title, excerpt, body);

const n = (t: string) => (db.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as any).c;
console.log(`✓ پایگاه داده ساخته شد`);
console.log(`  محصول‌ها : ${n('products')}`);
console.log(`  عکس‌ها   : ${n('product_images')}`);
console.log(`  دسته‌ها   : ${n('categories')}`);
console.log(`  مطلب‌ها   : ${n('posts')}`);
console.log(`  نرخ طلا  : ۲۲٬۰۰۰٬۰۰۰ تومان`);
db.close();
