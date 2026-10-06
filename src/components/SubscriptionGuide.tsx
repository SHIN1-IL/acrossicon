import { useState } from 'react';
import { ChevronDown, CreditCard } from 'lucide-react';
import { Locale } from '@/types';
import { t } from '@/i18n';
import {
  BUSINESS_PAYMENT,
  SUBSCRIPTION_PLANS,
  formatWon,
} from '@/lib/plans';

interface SubscriptionGuideProps {
  locale: Locale;
}

export function SubscriptionGuide({ locale }: SubscriptionGuideProps) {
  const [open, setOpen] = useState(false);
  const std = SUBSCRIPTION_PLANS.standard;
  const prem = SUBSCRIPTION_PLANS.premium;
  const biz = BUSINESS_PAYMENT;

  return (
    <div className="rounded-[10px] border border-accent-border bg-surface-banner">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-accent">
          <CreditCard className="h-3.5 w-3.5" />
          {t(locale, 'subscribe.toggle')}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-accent transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-accent-border/60 px-3 py-3 text-[11px] leading-relaxed text-zinc-300">
          <div className="space-y-1">
            <p className="font-semibold text-ink">
              💳 {t(locale, 'subscribe.standardTitle')}
            </p>
            <p className="text-zinc-400">
              {t(locale, 'subscribe.standardQuota', {
                daily: std.dailyLimit,
                monthly: std.monthlyLimit,
              })}
            </p>
            <p>
              {t(locale, 'subscribe.priceLine', {
                monthly: formatWon(std.priceMonthly, locale),
                semi: formatWon(std.priceSemiAnnual, locale),
                yearly: formatWon(std.priceYearly, locale),
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-sky-200">
              💳 {t(locale, 'subscribe.premiumTitle')}
            </p>
            <p className="text-zinc-400">
              {t(locale, 'subscribe.premiumQuota', {
                daily: prem.dailyLimit,
                monthly: prem.monthlyLimit,
              })}
            </p>
            <p>
              {t(locale, 'subscribe.priceLine', {
                monthly: formatWon(prem.priceMonthly, locale),
                semi: formatWon(prem.priceSemiAnnual, locale),
                yearly: formatWon(prem.priceYearly, locale),
              })}
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-surface-border bg-surface-overlay/80 px-2.5 py-2">
            <p>
              {biz.bankName} {biz.accountNumber} (
              {t(locale, 'subscribe.holder')}: {biz.accountHolder})
            </p>
            <p>
              {t(locale, 'subscribe.afterPay', {
                method: biz.contactMethod,
                contact: biz.contact,
                minutes: biz.keyDeliveryMinutes,
              })}
            </p>
            <p>
              {t(locale, 'subscribe.email')}:{' '}
              <a
                href={`mailto:${biz.contactEmail}`}
                className="text-accent hover:underline"
              >
                {biz.contactEmail}
              </a>
            </p>
            <p className="text-[10px] text-zinc-500">
              {t(locale, 'subscribe.memoHint')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
