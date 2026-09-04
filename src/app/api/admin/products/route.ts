import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session.ts';
import {
  createProduct, updateProduct, deleteProduct, setProductImage,
} from '@/lib/products-admin.ts';

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 });
  }
  const { action, id, data, image } = await req.json();

  try {
    if (action === 'delete') {
      deleteProduct(Number(id));
      return NextResponse.json({ ok: true });
    }

    let pid: number;
    if (action === 'update') {
      pid = Number(id);
      updateProduct(pid, data ?? {});
    } else {
      pid = createProduct(data ?? {}).id;
    }
    if (image) setProductImage(pid, String(image), String(data?.name_fa ?? ''));

    return NextResponse.json({ ok: true, id: pid });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    const dup = msg.includes('UNIQUE');
    return NextResponse.json(
      { ok: false, error: dup ? 'این نشانی یا کد کالا قبلاً استفاده شده.' : msg },
      { status: 400 },
    );
  }
}
