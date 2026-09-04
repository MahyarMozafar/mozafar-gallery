import type { Metadata } from 'next';
import './globals.css';
import { RateBar } from '@/components/RateBar.tsx';
import { Nav } from '@/components/Nav.tsx';
import { Footer } from '@/components/Footer.tsx';

export const metadata: Metadata = {
  title: 'گالری مظفر | خرید آنلاین طلا و جواهر',
  description:
    'خرید آنلاین طلا، سکه و شمش با قیمت لحظه‌ای، اجرت منصفانه، فاکتور رسمی و ضمانت اصالت.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl">
      <body>
        <RateBar />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
