/**
 * فرستادن پیامک.
 *
 * الان فقط کد را در ترمینال چاپ می‌کند — رایگان و برای ساخت کافی است.
 * وقتی خواستی واقعی شود، فقط یک کلاس جدید اینجا اضافه می‌کنی
 * (کاوه‌نگار یا SMS.ir) و در .env اسمش را می‌نویسی. هیچ جای دیگری عوض نمی‌شود.
 */

export interface SmsProvider {
  send(phone: string, text: string): Promise<void>;
}

/** حالت ساخت: کد را در ترمینال نشان می‌دهد. */
class ConsoleSms implements SmsProvider {
  async send(phone: string, text: string) {
    console.log('\n' + '─'.repeat(52));
    console.log(`  پیامک به ${phone}`);
    console.log(`  ${text}`);
    console.log('─'.repeat(52) + '\n');
  }
}

/**
 * کاوه‌نگار — هنوز وصل نیست.
 * وقتی کلید گرفتی، بدنه‌اش را پر کن و در .env بنویس SMS_PROVIDER=kavenegar
 */
class KavenegarSms implements SmsProvider {
  constructor(private apiKey: string) {}
  async send(phone: string, text: string) {
    throw new Error('کاوه‌نگار هنوز وصل نشده. فعلاً SMS_PROVIDER=console بگذار.');
  }
}

export function smsProvider(): SmsProvider {
  const name = process.env.SMS_PROVIDER ?? 'console';
  if (name === 'kavenegar' && process.env.KAVENEGAR_API_KEY) {
    return new KavenegarSms(process.env.KAVENEGAR_API_KEY);
  }
  return new ConsoleSms();
}
