/**
 * Delivery — Delivery & Returns page
 * Routes: /delivery, /hk/delivery, /cn/delivery
 */
import { Link } from 'react-router-dom';
import styles from './Delivery.module.css';

const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  shippingSection: { title: string; subtitle: string; items: { title: string; desc: string; icon: string }[] };
  returnsSection: { title: string; subtitle: string; items: { title: string; desc: string; icon: string }[] };
  faqSection: { title: string; items: { q: string; a: string }[] };
  contact: { title: string; text: string; btn: string };
  cta: { title: string; text: string; btn: string };
}> = {
  UK: {
    pageTitle: 'Delivery & Returns',
    pageSubtitle: 'Shipping options, delivery times, and our hassle-free returns policy.',
    heroTitle: 'Hassle-Free Delivery & Returns',
    heroSubtitle: 'We want you to love your purchase. That\'s why we make shipping and returns as smooth as possible.',
    shippingSection: {
      title: 'Shipping Options',
      subtitle: 'All orders are carefully packaged and dispatched within 1–2 business days.',
      items: [
        {
          title: 'Same-Day Delivery (London)',
          desc: 'Order before 2pm for same-day delivery within London postcodes. Tracked and insured.',
          icon: 'lightning',
        },
        {
          title: 'Standard UK Delivery',
          desc: 'Royal Mail Tracked 24 — arrives in 2–3 business days. Free on orders over £150.',
          icon: 'package',
        },
        {
          title: 'Express UK Delivery',
          desc: 'DPD Next Day — order by 2pm for next business day delivery. Fully tracked and insured.',
          icon: 'truck',
        },
        {
          title: 'International Shipping',
          desc: 'DHL Express worldwide — 3–7 business days. Duties and taxes may apply.',
          icon: 'globe',
        },
      ],
    },
    returnsSection: {
      title: 'Returns Policy',
      subtitle: 'Changed your mind? Not a problem. Our returns window gives you plenty of time.',
      items: [
        {
          title: '14-Day Return Window',
          desc: 'Return any item within 14 days of delivery for a full refund — no questions asked.',
          icon: 'calendar',
        },
        {
          title: 'Free Return Shipping',
          desc: 'Pre-paid return labels included. Simply drop off at any post office.',
          icon: 'arrow',
        },
        {
          title: 'Condition Requirements',
          desc: 'Items must be returned in their original condition with all tags attached.',
          icon: 'tag',
        },
        {
          title: 'Refund Timeline',
          desc: 'Refunds processed within 3–5 business days after we receive your return.',
          icon: 'clock',
        },
      ],
    },
    faqSection: {
      title: 'Common Questions',
      items: [
        { q: 'How do I track my order?', a: 'Once your order is dispatched, you\'ll receive an email with a tracking number. You can also track your order in your account dashboard.' },
        { q: 'Can I change my delivery address after ordering?', a: 'Contact us within 1 hour of placing your order and we\'ll do our best to update it before dispatch.' },
        { q: 'What if my item arrives damaged?', a: 'Take photos immediately and contact us within 24 hours. We\'ll arrange a replacement or full refund.' },
        { q: 'Do you ship to P.O. boxes?', a: 'Yes, we ship to P.O. boxes within the UK. International P.O. boxes may require alternative address.' },
        { q: 'Are duties and taxes included?', a: 'For UK orders, all duties and taxes are included. International orders may incur additional charges.' },
      ],
    },
    contact: {
      title: 'Need help with your delivery?',
      text: 'Our customer support team is available Mon–Fri 9:00–18:00 GMT.',
      btn: 'Contact Support',
    },
    cta: {
      title: 'Ready to start shopping?',
      text: 'Browse our full collection of authenticated luxury pieces.',
      btn: 'Shop Now',
    },
  },
  HK: {
    pageTitle: '送貨與退換',
    pageSubtitle: '送貨選項、送貨時間及我們的便捷退換政策。',
    heroTitle: '便捷送貨與退換服務',
    heroSubtitle: '我們希望您喜歡每一件購入的精品，因此致力令送貨和退換過程同樣順暢。',
    shippingSection: {
      title: '送貨方式',
      subtitle: '所有訂單將於 1–2 個工作天內妥善包裝及發送。',
      items: [
        {
          title: '即日送遞（香港島）',
          desc: '下午 2 時前落單，香港島範圍內即日送達。全程追蹤及保險。',
          icon: 'lightning',
        },
        {
          title: '標準送遞',
          desc: '順豐速運 — 2–4 個工作天送達。滿 HK$1,500 免運費。',
          icon: 'package',
        },
        {
          title: '特快送遞',
          desc: '順豐優先速遞 — 1–2 個工作天送達。全程追蹤及保險。',
          icon: 'truck',
        },
        {
          title: '海外配送',
          desc: 'DHL Express 全球速遞 — 3–7 個工作天送達。可能需繳付關稅及稅項。',
          icon: 'globe',
        },
      ],
    },
    returnsSection: {
      title: '退換政策',
      subtitle: '改變主意？我們的退換期限讓您有充足的考慮時間。',
      items: [
        {
          title: '7 天退換期',
          desc: '收貨後 7 天內可申請退換，全額退款，無需理由。',
          icon: 'calendar',
        },
        {
          title: '免費退貨運費',
          desc: '提供預付退貨標籤，只需寄回任何順豐網點。',
          icon: 'arrow',
        },
        {
          title: '退貨條件',
          desc: '商品須保持原狀，附有原有標籤及包裝。',
          icon: 'tag',
        },
        {
          title: '退款時間',
          desc: '收到退貨後 3–5 個工作天內完成退款。',
          icon: 'clock',
        },
      ],
    },
    faqSection: {
      title: '常見問題',
      items: [
        { q: '如何追蹤我的訂單？', a: '訂單發貨後，您將收到包含追蹤編號的電郵。您亦可於帳戶頁面查看追蹤資訊。' },
        { q: '我可以更改送貨地址嗎？', a: '請於下單後 1 小時內聯絡我們，我們將盡力在發貨前更新地址。' },
        { q: '如果商品損壞該怎麼辦？', a: '請立即拍下照片，並於 24 小時內聯絡我們。我們將安排更換或全額退款。' },
        { q: '你們提供門市自取嗎？', a: '目前我們僅提供送貨服務，暫不支援門市自取。' },
        { q: '運費包含保險嗎？', a: '所有訂單均包含基本運輸保險。如需升級保險，請聯絡我們。' },
      ],
    },
    contact: {
      title: '送貨需要協助？',
      text: '客戶服務團隊的辦公時間為星期一至五 10:00–19:00。',
      btn: '聯絡客服',
    },
    cta: {
      title: '準備好開始選購了嗎？',
      text: '瀏覽我們完整的認證奢品系列。',
      btn: '立即選購',
    },
  },
  CN: {
    pageTitle: '配送与退换',
    pageSubtitle: '配送方式、配送时间以及我们的便捷退换政策。',
    heroTitle: '便捷配送与退换服务',
    heroSubtitle: '我们希望您喜欢每一件购入的精品，因此致力于让配送和退换过程同样顺畅。',
    shippingSection: {
      title: '配送方式',
      subtitle: '所有订单将于 1–2 个工作日内妥善包装及发出。',
      items: [
        {
          title: '当日达（上海/北京）',
          desc: '下午 2 点前下单，上海/北京主城区当日送达。全程追踪及保险。',
          icon: 'lightning',
        },
        {
          title: '标准配送',
          desc: '顺丰速运 — 3–5 个工作日送达。满 ¥1,500 免运费。',
          icon: 'package',
        },
        {
          title: '特快配送',
          desc: '顺丰优先快递 — 1–2 个工作日送达。全程追踪及保险。',
          icon: 'truck',
        },
        {
          title: '海外配送',
          desc: 'DHL Express 全球快递 — 3–7 个工作日送达。可能需缴纳关税及税费。',
          icon: 'globe',
        },
      ],
    },
    returnsSection: {
      title: '退换政策',
      subtitle: '改变主意？我们的退换期限让您有充足的考虑时间。',
      items: [
        {
          title: '7 天退换期',
          desc: '收货后 7 天内可申请退换，全额退款，无需理由。',
          icon: 'calendar',
        },
        {
          title: '免费退货运费',
          desc: '提供预付退货标签，只需寄回任何顺丰网点。',
          icon: 'arrow',
        },
        {
          title: '退货条件',
          desc: '商品须保持原状，附有原有标签及包装。',
          icon: 'tag',
        },
        {
          title: '退款时间',
          desc: '收到退货后 3–5 个工作日内完成退款。',
          icon: 'clock',
        },
      ],
    },
    faqSection: {
      title: '常见问题',
      items: [
        { q: '如何追踪我的订单？', a: '订单发货后，您将收到包含追踪编号的短信/邮件。您亦可于个人中心查看追踪信息。' },
        { q: '我可以更改收货地址吗？', a: '请于下单后 1 小时内联系我们，我们将在发货前尽力更新地址。' },
        { q: '如果商品损坏该怎么办？', a: '请立即拍下照片，并于 24 小时内联系我们。我们将安排换货或全额退款。' },
        { q: '你们提供门店自提吗？', a: '目前我们仅提供配送服务，暂不支持门店自提。' },
        { q: '运费包含保险吗？', a: '所有订单均包含基本运输保险。如需升级保险，请联系我们。' },
      ],
    },
    contact: {
      title: '配送需要帮助？',
      text: '客户服务团队的工作时间为周一至周五 9:00–18:00。',
      btn: '联系客服',
    },
    cta: {
      title: '准备好开始选购了吗？',
      text: '浏览我们完整的认证奢品系列。',
      btn: '立即选购',
    },
  },
};

// ── Icon map ─────────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  lightning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  package: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  truck: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  arrow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

function SectionIcon({ icon }: { icon: string }) {
  return (
    <div className={styles.sectionIcon}>
      {ICONS[icon] ?? ICONS.package}
    </div>
  );
}

export default function Delivery() {
  const lang = document.documentElement.lang?.startsWith('zh') ? (document.documentElement.lang === 'zh-HK' ? 'HK' : 'CN') : 'UK';
  const t = COPY[lang] ?? COPY.CN;

  const marketPrefix = lang === 'UK' ? '' : `/${lang.toLowerCase()}`;

  return (
    <div className={styles.page} data-testid="delivery-page">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t.pageTitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
        </div>
      </section>

      <div className={styles.content}>
        {/* Shipping */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.shippingSection.title}</h2>
            <p className={styles.sectionSubtitle}>{t.shippingSection.subtitle}</p>
          </div>
          <div className={styles.cardGrid}>
            {t.shippingSection.items.map((item, i) => (
              <div key={i} className={styles.card}>
                <SectionIcon icon={item.icon} />
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Returns */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.returnsSection.title}</h2>
            <p className={styles.sectionSubtitle}>{t.returnsSection.subtitle}</p>
          </div>
          <div className={styles.cardGrid}>
            {t.returnsSection.items.map((item, i) => (
              <div key={i} className={styles.card}>
                <SectionIcon icon={item.icon} />
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleCentered}>{t.faqSection.title}</h2>
          <div className={styles.faqList}>
            {t.faqSection.items.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{item.q}</h3>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Contact CTA */}
        <section className={styles.contactBanner}>
          <div className={styles.contactBannerContent}>
            <h2 className={styles.contactBannerTitle}>{t.contact.title}</h2>
            <p className={styles.contactBannerText}>{t.contact.text}</p>
            <Link to={`${marketPrefix}/support`} className={styles.contactBannerBtn}>
              {t.contact.btn}
            </Link>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Shop CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>{t.cta.title}</h2>
          <p className={styles.ctaText}>{t.cta.text}</p>
          <Link to={`${marketPrefix}/products`} className={styles.ctaBtn}>
            {t.cta.btn}
          </Link>
        </section>
      </div>
    </div>
  );
}
