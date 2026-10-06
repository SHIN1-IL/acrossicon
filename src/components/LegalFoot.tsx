import { t } from '@/i18n';
import { Locale } from '@/types';

const PRIVACY_URL = 'https://acrossicon.onrender.com/privacy';
const CONTACT_PHONE = '070-8065-1258';
const CONTACT_TEL = 'tel:07080651258';

interface LegalFootProps {
  locale: Locale;
  /** Extra top margin when sitting under a panel. */
  className?: string;
}

/** Compact legal line — same pattern as 3분 블로그. */
export function LegalFoot({ locale, className = '' }: LegalFootProps) {
  return (
    <footer
      className={`text-center text-[10px] leading-relaxed text-zinc-500 ${className}`}
    >
      <p className="m-0">
        ACROSSTOOL ·{' '}
        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {t(locale, 'legal.privacy')}
        </a>
        {' · '}
        {t(locale, 'legal.contact')}{' '}
        <a href={CONTACT_TEL} className="text-accent hover:underline">
          {CONTACT_PHONE}
        </a>
      </p>
      <p className="m-0 mt-0.5 text-[9px] text-zinc-600">
        {t(locale, 'legal.merchant')}
      </p>
    </footer>
  );
}

export const LEGAL = {
  privacyUrl: PRIVACY_URL,
  phone: CONTACT_PHONE,
} as const;
