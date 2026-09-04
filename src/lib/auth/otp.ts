/**
 * ورود با شماره موبایل و کد پیامکی.
 *
 * چند نکته امنیتی که رعایت شده:
 *  - کد به شکل خام ذخیره نمی‌شود، هش می‌شود
 *  - تعداد تلاش محدود است (۵ بار)
 *  - کد ۲ دقیقه اعتبار دارد
 *  - نمی‌شود پشت سر هم کد درخواست کرد (۶۰ ثانیه فاصله)
 */
import 'server-only';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { db, migrate } from '../db/index.ts';
import { smsProvider } from './sms.ts';

const CODE_TTL_SEC   = 120;   // اعتبار کد
const RESEND_WAIT_SEC = 60;   // فاصله بین دو درخواست
const MAX_ATTEMPTS    = 5;

const hash = (s: string) => createHash('sha256').update(s).digest('hex');

/** شماره را یکدست می‌کند: ۰۹۱۲... یا +98912... همه می‌شوند 09121234567 */
export function normalizePhone(input: string): string | null {
  let s = input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\s\-()]/g, '');
  if (s.startsWith('+98')) s = '0' + s.slice(3);
  else if (s.startsWith('0098')) s = '0' + s.slice(4);
  else if (s.startsWith('98') && s.length === 12) s = '0' + s.slice(2);
  else if (s.startsWith('9') && s.length === 10) s = '0' + s;
  return /^09\d{9}$/.test(s) ? s : null;
}

export interface OtpResult { ok: boolean; error?: string; devCode?: string }

/** کد می‌فرستد. */
export async function requestCode(rawPhone: string): Promise<OtpResult> {
  migrate();
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: 'شماره موبایل درست نیست.' };

  const d = db();
  const last = d.prepare(
    "SELECT created_at FROM otp_codes WHERE phone = ? ORDER BY id DESC LIMIT 1",
  ).get(phone) as any;

  if (last) {
    const ageSec = (d.prepare(
      "SELECT CAST((julianday('now') - julianday(?)) * 86400 AS INTEGER) AS s",
    ).get(last.created_at) as any).s;
    if (ageSec < RESEND_WAIT_SEC) {
      return { ok: false, error: `تا ${RESEND_WAIT_SEC - ageSec} ثانیه دیگر صبر کنید.` };
    }
  }

  const code = String(randomInt(10000, 100000)); // ۵ رقمی
  d.prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone);
  d.prepare(
    `INSERT INTO otp_codes (phone, code_hash, expires_at)
     VALUES (?, ?, datetime('now', '+${CODE_TTL_SEC} seconds'))`,
  ).run(phone, hash(code));

  await smsProvider().send(phone, `کد ورود شما به گالری مظفر: ${code}`);

  // فقط در حالت ساخت کد را برمی‌گردانیم تا کار کردن راحت باشد
  const dev = (process.env.SMS_PROVIDER ?? 'console') === 'console';
  return { ok: true, devCode: dev ? code : undefined };
}

export interface VerifyResult {
  ok: boolean; error?: string; userId?: number; isNew?: boolean;
}

/** کد را بررسی می‌کند و اگر درست بود، کاربر را می‌سازد یا پیدا می‌کند. */
export function verifyCode(rawPhone: string, code: string): VerifyResult {
  migrate();
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: 'شماره موبایل درست نیست.' };

  const d = db();
  const row = d.prepare(
    'SELECT * FROM otp_codes WHERE phone = ? ORDER BY id DESC LIMIT 1',
  ).get(phone) as any;

  if (!row)              return { ok: false, error: 'اول کد را درخواست کنید.' };
  if (row.consumed_at)   return { ok: false, error: 'این کد قبلاً استفاده شده.' };
  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'تعداد تلاش زیاد شد. دوباره کد بگیرید.' };
  }

  const expired = (d.prepare(
    "SELECT (expires_at < datetime('now')) AS e FROM otp_codes WHERE id = ?",
  ).get(row.id) as any).e;
  if (expired) return { ok: false, error: 'کد منقضی شده. دوباره بگیرید.' };

  const clean = code.replace(/[۰-۹]/g, (x) => String(x.charCodeAt(0) - 0x06f0)).trim();
  if (hash(clean) !== row.code_hash) {
    d.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    const left = MAX_ATTEMPTS - (row.attempts + 1);
    return { ok: false, error: `کد درست نیست. ${left} تلاش باقی مانده.` };
  }

  d.prepare("UPDATE otp_codes SET consumed_at = datetime('now') WHERE id = ?").run(row.id);

  // شماره جدید = حساب جدید. دکمه «ثبت‌نام» جدا نداریم.
  let user = d.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as any;
  let isNew = false;
  if (!user) {
    d.prepare('INSERT INTO users (phone) VALUES (?)').run(phone);
    user = d.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as any;
    isNew = true;
  }
  return { ok: true, userId: user.id, isNew };
}

/** یک نشست می‌سازد و شناسه‌اش را برمی‌گرداند. */
export function createSession(userId: number): string {
  migrate();
  const token = randomUUID() + randomUUID().replace(/-/g, '');
  db().prepare(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES (?, ?, datetime('now', '+30 days'))`,
  ).run(hash(token), userId);
  return token;
}

export interface SessionUser { id: number; phone: string; name: string | null; role: string }

/** کاربر این نشست را برمی‌گرداند، یا null. */
export function userForToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  migrate();
  const r = db().prepare(`
    SELECT u.id, u.phone, u.name, u.role
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')`).get(hash(token)) as any;
  return r ?? null;
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  migrate();
  db().prepare('DELETE FROM sessions WHERE token = ?').run(hash(token));
}
