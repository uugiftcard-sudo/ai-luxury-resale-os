/**
 * Market types — UK / HK / CN triple-region support.
 * Each market has its own domain, currency, language, and branding.
 */

export type Market = 'UK' | 'HK' | 'CN';

export const MARKETS: Market[] = ['UK', 'HK', 'CN'];

export interface MarketConfig {
  /** URL prefix for routing */
  path: string;
  /** Display name in the market's native language */
  displayName: string;
  /** Primary language */
  language: 'en' | 'zh-HK' | 'zh-CN';
  /** HTML lang attribute */
  lang: string;
  /** Currency code */
  currency: string;
  /** Currency symbol */
  currencySymbol: string;
  /** Locale for toLocaleString */
  locale: string;
  /** TLD */
  tld: string;
  /** Exchange rate: how many units of this market's currency per 1 CNY */
  exchangeRate: number;
  /** Tagline shown in hero */
  tagline: string;
  /** Headline shown in hero */
  headline: string;
  /** Sub-headline */
  subheadline: string;
  /** CTA button 1 */
  ctaPrimary: string;
  /** CTA button 2 */
  ctaSecondary: string;
  /** Trust section title */
  trustTitle: string;
  /** Meta title suffix */
  metaTitle: string;
}

export const MARKET_CONFIGS: Record<Market, MarketConfig> = {
  UK: {
    path: '',
    displayName: 'United Kingdom',
    language: 'en',
    lang: 'en-GB',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    tld: 'co.uk',
    exchangeRate: 0.11,   // 1 CNY ≈ 0.11 GBP
    tagline: 'Authenticated Luxury · Same-Day UK Delivery',
    headline: 'Pre-Loved Luxury,\nPerfected.',
    subheadline:
      'Hand-picked authenticated Chanel, Gucci, Hermès and more. ' +
      'Every item verified by our expert authenticators before it ships.',
    ctaPrimary: 'Shop Now',
    ctaSecondary: 'Browse Bags',
    trustTitle: 'Why CLOTH UK',
    metaTitle: 'CLOTH UK — Authenticated Pre-Loved Luxury',
  },
  HK: {
    path: 'hk',
    displayName: 'Hong Kong',
    language: 'zh-HK',
    lang: 'zh-HK',
    currency: 'HKD',
    currencySymbol: 'HK$',
    locale: 'zh-HK',
    tld: 'hk',
    exchangeRate: 1.32,   // 1 CNY ≈ 1.32 HKD
    tagline: '認證奢品 · 全港送遞',
    headline: '循環奢品\n煥然一新',
    subheadline:
      '嚴格鑑定每一件，Chanel、Gucci、Hermès 等頂級品牌。' +
      '香港本地或跨境直送，讓奢品觸手可及。',
    ctaPrimary: '立即選購',
    ctaSecondary: '看看袋款',
    trustTitle: '服務保障',
    metaTitle: 'CLOTH HK — 認證二手奢侈品平台',
  },
  CN: {
    path: 'cn',
    displayName: '中国',
    language: 'zh-CN',
    lang: 'zh-CN',
    currency: 'CNY',
    currencySymbol: '¥',
    locale: 'zh-CN',
    tld: 'cn',
    exchangeRate: 1.0,
    tagline: '二手奢品 · 正品保障',
    headline: '让奢品\n循环新生',
    subheadline:
      '汇聚全球顶级品牌的二手好物，Gucci、Chanel、Prada、Louis Vuitton...' +
      '每件商品经过严格鉴定，让奢华触手可及。',
    ctaPrimary: '探索全部商品',
    ctaSecondary: '看看包袋',
    trustTitle: '服务保障',
    metaTitle: 'CLOTH 二手奢侈品时尚交易平台',
  },
};

/** Convert a CNY price to any market's currency (rounds to nearest integer). */
export function convertPrice(cnyPrice: number, market: Market): number {
  const rate = MARKET_CONFIGS[market].exchangeRate;
  return Math.round(cnyPrice * rate);
}

/** Format a price in a market's currency. */
export function formatPrice(amount: number, market: Market): string {
  const config = MARKET_CONFIGS[market];
  return `${config.currencySymbol}${amount.toLocaleString(config.locale)}`;
}
