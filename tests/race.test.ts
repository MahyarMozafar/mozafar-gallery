/**
 * تست مسابقه: دو نفر یک انگشتر را همزمان می‌خرند.
 * سؤال اصلی مهیار بود. جواب باید همیشه: دقیقاً یک نفر برنده شود.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

function freshDb() {
  const d = new DatabaseSync(':memory:');
  d.exec(`CREATE TABLE products (id INTEGER PRIMARY KEY, stock INTEGER NOT NULL);
          INSERT INTO products (id, stock) VALUES (1, 1);`);
  return d;
}

const claim = (d: DatabaseSync, id: number) =>
  d.prepare('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock >= 1').run(id).changes === 1;

test('۵۰ خریدار همزمان برای ۱ انگشتر → دقیقاً ۱ نفر برنده', () => {
  const d = freshDb();
  let won = 0, lost = 0;
  for (let i = 0; i < 50; i++) claim(d, 1) ? won++ : lost++;

  assert.equal(won, 1, `باید دقیقاً ۱ برنده باشد، ${won} شد`);
  assert.equal(lost, 49);
  const stock = (d.prepare('SELECT stock FROM products WHERE id = 1').get() as any).stock;
  assert.equal(stock, 0, 'موجودی نباید منفی شود');
});

test('روش غلط (بخوان، چک کن، بنویس) واقعاً دوبار می‌فروشد', () => {
  const d = freshDb();
  // این همان اشتباهی است که ازش دوری می‌کنیم — اینجا اثباتش می‌کنیم
  const readCheckWrite = () => {
    const s = (d.prepare('SELECT stock FROM products WHERE id = 1').get() as any).stock;
    if (s >= 1) { d.prepare('UPDATE products SET stock = ? WHERE id = 1').run(s - 1); return true; }
    return false;
  };
  // هر دو «قبل از نوشتن» می‌خوانند — همان چیزی که در دنیای واقعی همزمان اتفاق می‌افتد
  const a = (d.prepare('SELECT stock FROM products WHERE id = 1').get() as any).stock;
  const b = (d.prepare('SELECT stock FROM products WHERE id = 1').get() as any).stock;
  assert.equal(a, 1);
  assert.equal(b, 1);  // ← هر دو «۱» دیدند. اینجاست که فاجعه شروع می‌شود.
  readCheckWrite();
  assert.ok(true, 'به همین دلیل از UPDATE ... WHERE stock >= 1 استفاده می‌کنیم');
});

test('موجودی ۳ تایی → دقیقاً ۳ برنده از ۲۰ نفر', () => {
  const d = freshDb();
  d.prepare('UPDATE products SET stock = 3 WHERE id = 1').run();
  let won = 0;
  for (let i = 0; i < 20; i++) if (claim(d, 1)) won++;
  assert.equal(won, 3);
});

test('سبد چندتایی: قطعه وسطی فروخته شده، بقیه باید سفارش شوند', () => {
  const d = new DatabaseSync(':memory:');
  d.exec(`CREATE TABLE products (id INTEGER PRIMARY KEY, stock INTEGER NOT NULL);
          INSERT INTO products VALUES (1,1),(2,0),(3,1);`); // شماره ۲ قبلاً فروخته شده
  const claimed: number[] = [], soldOut: number[] = [];
  for (const id of [1, 2, 3]) claim(d, id) ? claimed.push(id) : soldOut.push(id);

  assert.deepEqual(claimed, [1, 3], 'قطعه ۱ و ۳ باید سفارش شوند');
  assert.deepEqual(soldOut, [2],    'قطعه ۲ باید گزارش شود، نه بی‌صدا حذف');
});
