import { shopInfo } from '@/lib/shop.ts';
export const dynamic = 'force-dynamic';

export default function About() {
  const s = shopInfo();
  return (
    <section className="band">
      <div className="wrap" style={{ maxWidth: '44rem' }}>
        <p className="eyebrow">درباره ما</p>
        <h1>گالری مظفر</h1>
        <p className="lead">
          ما طلا و جواهر را با قیمت شفاف می‌فروشیم. روی هر قطعه، وزن و عیار و اجرت
          و مالیات جداگانه نوشته شده تا دقیقاً بدانید بابت چه چیزی پول می‌دهید.
        </p>
        <h2>چرا قیمت‌ها لحظه‌ای است؟</h2>
        <p>
          قیمت طلا هر روز — و حتی هر ساعت — تغییر می‌کند. ما قیمت را از نرخ روز بازار
          حساب می‌کنیم، نه از یک لیست قدیمی. برای همین عددی که می‌بینید همان عددی است
          که همین حالا درست است.
        </p>
        <h2>تماس</h2>
        <p className="num" style={{ direction: 'ltr', textAlign: 'right' }}>{s.phone}</p>
        <p>{s.address}</p>
        <div className="notice">
          این سایت یک نمونه‌کار است. شماره‌ها و قیمت‌ها آزمایشی هستند.
        </div>
      </div>
    </section>
  );
}
