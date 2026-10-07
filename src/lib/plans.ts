/** AcrossIcon paid plans — keep in sync with backend ops pricing. */
export const SUBSCRIPTION_PLANS = {
  standard: {
    id: 'standard' as const,
    priceMonthly: 14900,
    priceSemiAnnual: 74500,
    priceYearly: 149000,
    dailyLimit: 20,
    monthlyLimit: 60,
  },
  premium: {
    id: 'premium' as const,
    priceMonthly: 29900,
    priceSemiAnnual: 149500,
    priceYearly: 299000,
    dailyLimit: 30,
    monthlyLimit: 120,
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

/** Same ACROSSTOOL payment contacts as 3분 블로그. */
export const BUSINESS_PAYMENT = {
  bankName: '하나은행',
  accountNumber: '365-910996-44807',
  accountHolder: '신일',
  contactMethod: '카톡/문자',
  contact: '070-8065-1258',
  contactTel: 'tel:07080651258',
  contactEmail: 'acrosstool@gmail.com',
  keyDeliveryMinutes: 10,
} as const;

export function formatWon(amount: number, locale: string): string {
  return amount.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR');
}
