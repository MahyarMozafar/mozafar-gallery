import { settings, goldRates, shopInfo } from '@/lib/shop.ts';
import { SettingsForm } from '@/components/SettingsForm.tsx';
import { faMoney, faDateTime } from '@/lib/format/fa.ts';
import { getSetting, getSettingNum } from '@/lib/db/index.ts';

export const dynamic = 'force-dynamic';

export default function AdminSettings() {
  const s = settings();
  const r = goldRates();
  const info = shopInfo();

  return (
    <>
      <h1 style={{ fontSize: '1.5rem' }}>تنظیمات</h1>
      <p className="muted small" style={{ marginBlockEnd: '1.5rem' }}>
        هر چیزی که اینجا عوض کنید، بلافاصله روی قیمت همه‌ی محصولات اثر می‌گذارد.
        آخرین بروزرسانی نرخ: {faDateTime(r.fetchedAt)}
      </p>

      <SettingsForm
        initial={{
          manualGram18:  getSettingNum('manualGram18', 22000000),
          changePercent: getSettingNum('changePercent', 0),
          priceAdjustment: getSettingNum('priceAdjustment', 0),
          profitPercent: s.profitPercent,
          vatPercent: s.vatPercent,
          defaultOjratPercent: s.defaultOjratPercent,
          barFeePercent: s.barFeePercent,
          coinProfitPercent: s.coinProfitPercent,
          shippingToman: info.shipping,
          reservationMinutes: getSettingNum('reservationMinutes', 5),
          paymentWindowMinutes: getSettingNum('paymentWindowMinutes', 30),
          shopCardNumber: getSetting('shopCardNumber', ''),
          shopCardHolder: getSetting('shopCardHolder', ''),
          goldProvider: getSetting('goldProvider', 'manual'),
        }}
        currentRates={{ gram18: r.gram18, gram21: r.gram21, gram24: r.gram24, gram740: r.gram740 }}
      />
    </>
  );
}
