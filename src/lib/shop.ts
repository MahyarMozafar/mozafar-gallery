/**
 * لایه‌ی داده‌ی فروشگاه.
 * صفحه‌ها فقط از این فایل داده می‌گیرند و از پایگاه داده خبر ندارند.
 * همه‌ی قیمت‌ها اینجا — روی سرور — حساب می‌شوند، هرگز در مرورگر.
 */
import 'server-only';
import { db, migrate, getSettingNum, getSetting } from './db/index.ts';
import { deriveRates } from './pricing/derive.ts';
import { calculatePrice } from './pricing/calculate.ts';
import type { GoldRates, PriceBreakdown, ShopSettings, ProductType, Karat } from './pricing/types.ts';

let ready = false;
function ensure() {
  if (!ready) { migrate(); ready = true; }
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  type: ProductType;
  categorySlug: string;
  categoryName: string;
  audience: string;
  karat: Karat | null;
  weightGrams: number | null;
  sizeLabel: string | null;
  color: string | null;
  stone: string | null;
  brand: string | null;
  description: string | null;
  stock: number;
  featured: boolean;
  image: string;
  price: PriceBreakdown;
}

/** تنظیمات مغازه از پایگاه داده. */
export function settings(): ShopSettings {
  ensure();
  return {
    profitPercent:       getSettingNum('profitPercent', 7),
    vatPercent:          getSettingNum('vatPercent', 10),
    defaultOjratPercent: getSettingNum('defaultOjratPercent', 12),
    barFeePercent:       getSettingNum('barFeePercent', 1.5),
    coinProfitPercent:   getSettingNum('coinProfitPercent', 2),
  };
}

/**
 * نرخ لحظه‌ای طلا.
 *
 * ۶۰ ثانیه کش می‌شود. این همان چیزی است که سایت را در برابر
 * ۱۰٬۰۰۰ بازدیدکننده هم‌زمان نگه می‌دارد: هر چقدر آدم بیاید،
 * فقط دقیقه‌ای یک بار سراغ منبع می‌رویم.
 */
let cache: { rates: GoldRates; at: number } | null = null;
const TTL_MS = 60_000;

export function goldRates(): GoldRates {
  ensure();
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rates;

  const provider = getSetting('goldProvider', 'manual');
  const gram18   = getSettingNum('manualGram18', 22_000_000);
  const change   = getSettingNum('changePercent', 0);
  const adjust   = getSettingNum('priceAdjustment', 0);

  const rates = deriveRates(gram18, change, provider, adjust);
  cache = { rates, at: Date.now() };
  return rates;
}

/** کش را دور می‌ریزد — بعد از اینکه مدیر نرخ را عوض کرد. */
export function clearRateCache() { cache = null; }

function toProduct(r: any, rates: GoldRates, s: ShopSettings): Product {
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name_fa,
    type: r.type,
    categorySlug: r.cat_slug ?? '',
    categoryName: r.cat_name ?? '',
    audience: r.audience,
    karat: r.karat,
    weightGrams: r.weight_grams,
    sizeLabel: r.size_label,
    color: r.color,
    stone: r.stone,
    brand: r.brand,
    description: r.description_fa,
    stock: r.stock,
    featured: !!r.featured,
    image: r.image ?? '/products/placeholder.jpg',
    price: calculatePrice({
      type: r.type,
      weightGrams: r.weight_grams ?? undefined,
      karat: (r.karat ?? undefined) as Karat | undefined,
      ojratPercent: r.ojrat_percent ?? undefined,
      profitPercent: r.profit_percent ?? undefined,
      fixedPriceToman: r.fixed_price ?? undefined,
      coinMarketToman: r.coin_market ?? undefined,
    }, rates, s),
  };
}

const SELECT = `
  SELECT p.*, c.slug AS cat_slug, c.name_fa AS cat_name,
         (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY sort LIMIT 1) AS image
  FROM products p LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.status = 'ACTIVE'`;

export function allProducts(): Product[] {
  ensure();
  const rates = goldRates(); const s = settings();
  return (db().prepare(`${SELECT} ORDER BY p.featured DESC, p.id`).all() as any[])
    .map((r) => toProduct(r, rates, s));
}

export function featuredProducts(limit = 8): Product[] {
  return allProducts().filter((p) => p.featured).slice(0, limit);
}

export function productBySlug(slug: string): Product | null {
  ensure();
  const r = db().prepare(`${SELECT} AND p.slug = ?`).get(slug) as any;
  if (!r) return null;
  return toProduct(r, goldRates(), settings());
}

export function productsByIds(ids: number[]): Product[] {
  if (!ids.length) return [];
  ensure();
  const rates = goldRates(); const s = settings();
  const marks = ids.map(() => '?').join(',');
  return (db().prepare(`${SELECT} AND p.id IN (${marks})`).all(...ids) as any[])
    .map((r) => toProduct(r, rates, s));
}

export interface Category { slug: string; name: string; audience: string; count: number }

export function categories(): Category[] {
  ensure();
  return (db().prepare(`
    SELECT c.slug, c.name_fa AS name, c.audience,
           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status='ACTIVE') AS count
    FROM categories c ORDER BY c.sort`).all() as any[])
    .map((r) => ({ slug: r.slug, name: r.name, audience: r.audience, count: r.count }));
}

export interface Post { slug: string; title: string; excerpt: string; body: string }

export function posts(): Post[] {
  ensure();
  return (db().prepare(
    'SELECT slug, title_fa, excerpt_fa, body_fa FROM posts WHERE published_at IS NOT NULL ORDER BY id DESC',
  ).all() as any[]).map((r) => ({
    slug: r.slug, title: r.title_fa, excerpt: r.excerpt_fa, body: r.body_fa,
  }));
}

export function postBySlug(slug: string): Post | null {
  ensure();
  const r = db().prepare(
    'SELECT slug, title_fa, excerpt_fa, body_fa FROM posts WHERE slug = ?').get(slug) as any;
  return r ? { slug: r.slug, title: r.title_fa, excerpt: r.excerpt_fa, body: r.body_fa } : null;
}

export function shopInfo() {
  ensure();
  return {
    name:    getSetting('shopName', 'گالری مظفر'),
    phone:   getSetting('shopPhone', ''),
    address: getSetting('shopAddress', ''),
    card:    getSetting('shopCardNumber', ''),
    holder:  getSetting('shopCardHolder', ''),
    shipping: getSettingNum('shippingToman', 450000),
  };
}
