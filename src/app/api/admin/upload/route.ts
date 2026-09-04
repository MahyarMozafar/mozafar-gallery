/** آپلود عکس محصول. */
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth/session.ts';

const MAX_BYTES = 6 * 1024 * 1024; // ۶ مگابایت
const OK_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png',
  'image/webp': 'webp', 'image/avif': 'avif',
};

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'فایلی نیامد' }, { status: 400 });
  }
  const ext = OK_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: 'فقط JPG، PNG، WebP یا AVIF' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'عکس بزرگ‌تر از ۶ مگابایت است' }, { status: 400 });
  }

  // نام فایل را خودمان می‌سازیم — نام فرستاده‌شده هرگز قابل اعتماد نیست
  const name = `${randomUUID()}.${ext}`;
  const dir = join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
