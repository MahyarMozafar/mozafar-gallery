/**
 * اتصال به پایگاه داده.
 *
 * الان SQLite است چون روی همین لپ‌تاپ بدون نصب چیزی کار می‌کند.
 * موقع رفتن روی سرور واقعی، فقط همین فایل به PostgreSQL عوض می‌شود.
 * بقیه‌ی برنامه فقط با توابع پایین کار می‌کند و از پایگاه داده خبر ندارد.
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let _db: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (_db) return _db;
  const file = process.env.SQLITE_PATH || join(process.cwd(), 'data', 'shop.db');
  _db = new DatabaseSync(file);
  _db.exec('PRAGMA journal_mode = WAL');
  _db.exec('PRAGMA foreign_keys = ON');
  return _db;
}

/** جدول‌ها را می‌سازد اگر نباشند. */
export function migrate(database: DatabaseSync = db()): void {
  const sql = readFileSync(join(process.cwd(), 'src/lib/db/schema.sql'), 'utf8');
  database.exec(sql);
}

/** یک تنظیم را می‌خواند. */
export function getSetting(key: string, fallback: string): string {
  const row = db().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? fallback;
}

export function getSettingNum(key: string, fallback: number): number {
  const v = Number(getSetting(key, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

export function setSetting(key: string, value: string): void {
  db().prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  ).run(key, value);
}

/**
 * ردیف‌های node:sqlite «آبجکت ساده» نیستند (پروتوتایپ ندارند)،
 * و React نمی‌تواند چیزی را که ساده نیست به بخش مرورگر بفرستد.
 * این تابع آن‌ها را ساده می‌کند.
 */
export function plain<T>(row: any): T {
  return (row == null ? row : { ...row }) as T;
}

export function plainAll<T>(rows: any[]): T[] {
  return rows.map((r) => ({ ...r })) as T[];
}
