/**
 * Privacy — Privacy Policy page
 * Routes: /privacy, /hk/privacy, /cn/privacy
 */
import styles from './Privacy.module.css';

const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  sections: { title: string; content: string }[];
  contactEmail: string;
  contactTitle: string;
  lastUpdated: string;
}> = {
  UK: {
    pageTitle: 'Privacy Policy',
    pageSubtitle: 'How we collect, use, and protect your personal information.',
    heroTitle: 'Your Privacy Matters',
    heroSubtitle: 'We are committed to protecting your personal data and being transparent about how we use it.',
    sections: [
      {
        title: '1. Information We Collect',
        content: 'We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact us for support. This includes your name, email address, postal address, phone number, payment information, and order history. We also collect certain technical information automatically when you visit our website, including your IP address, browser type, operating system, and browsing behaviour on our site.',
      },
      {
        title: '2. How We Use Your Information',
        content: 'We use the information we collect to process and fulfil your orders, communicate with you about your purchases and account, send you marketing communications (with your consent), improve our website and services, detect and prevent fraud and abuse, and comply with our legal obligations. We never sell your personal data to third parties.',
      },
      {
        title: '3. Information Sharing',
        content: 'We share your information with trusted third-party service providers who assist us in operating our website, processing payments, delivering orders, and conducting business operations. These include payment processors (such as Stripe), logistics partners (Royal Mail, DHL, SF Express), email service providers, and analytics platforms. All such parties are contractually obligated to keep your information secure and use it only for the purposes we specify.',
      },
      {
        title: '4. Data Retention',
        content: 'We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, including for accounting, legal compliance, and fraud prevention purposes. Account data is retained while your account is active and for a period of 3 years after your last activity. Order records are retained for 7 years to comply with tax and consumer rights legislation.',
      },
      {
        title: '5. Your Rights',
        content: 'Under the UK GDPR and the Data Protection Act 2018, you have the right to access, rectify, erase, restrict processing of, and port your personal data. You also have the right to object to certain processing, including direct marketing. To exercise any of these rights, please contact us at privacy@cloth-uk.com. We will respond to your request within 30 days.',
      },
      {
        title: '6. Cookies & Tracking',
        content: 'Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and personalise content. Essential cookies are required for the website to function properly. Analytics and marketing cookies require your consent, which you can manage through our cookie consent banner at any time.',
      },
      {
        title: '7. Data Security',
        content: 'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These include SSL/TLS encryption for data in transit, AES-256 encryption for data at rest, regular security audits, and access controls limiting who in our team can access personal data.',
      },
      {
        title: "8. Children's Privacy",
        content: "Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected such information, please contact us immediately and we will take steps to delete it.",
      },
      {
        title: '9. International Transfers',
        content: 'If you are located outside the United Kingdom, please note that your information may be transferred to and processed in the United Kingdom and other countries that may have different data protection laws. When we transfer data internationally, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the UK Information Commissioner\'s Office.',
      },
      {
        title: '10. Changes to This Policy',
        content: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page with a revised "Last Updated" date. Your continued use of our services after any changes constitutes your acceptance of the revised policy.',
      },
    ],
    contactEmail: 'privacy@cloth-uk.com',
    contactTitle: 'Questions about this policy?',
    lastUpdated: 'Last updated: May 2026',
  },
  HK: {
    pageTitle: '隱私政策',
    pageSubtitle: '我們如何收集、使用及保障您的個人資訊。',
    heroTitle: '您的隱私是我們的首要考量',
    heroSubtitle: '我們致力保障您的個人資料，並對其使用方式保持透明。',
    sections: [
      {
        title: '1. 我們收集的資訊',
        content: '我們直接向您收集您主動提供的資訊，例如建立帳戶、下單、訂閱電子報或聯絡客服時。此包括您的姓名、電郵地址、郵寄地址、電話號碼、付款資訊及訂單記錄。當您瀏覽我們的網站時，我們亦會自動收集某些技術資訊，包括 IP 地址、瀏覽器類型、操作系統及在我們網站上的瀏覽行為。',
      },
      {
        title: '2. 我們如何使用您的資訊',
        content: '我們使用收集到的資訊來處理和履行您的訂單、與您溝通有關您的購買和帳戶、在您同意的情況下向您發送市場推廣資訊、改善我們的網站和服務、偵測及防止欺詐和濫用，以及履行我們的法律義務。我們絕不會將您的個人資料出售予第三方。',
      },
      {
        title: '3. 資訊分享',
        content: '我們與可信賴的第三方服務供應商分享您的資訊，以協助我們營運網站、處理付款、交付訂單及執行業務。這包括付款處理商（如 Stripe）、物流合作夥伴（順豐速運、DHL）、電郵服務供應商及分析平台。所有相關方均須根據合約保障您的資訊安全，並僅按我們指定的目的使用該資訊。',
      },
      {
        title: '4. 資料保留',
        content: '我們保留您的個人資料，以實現本政策所述目的的必要時間，包括會計、法律合規及欺詐預防目的。帳戶資料在您的帳戶活躍期間及最後一次活動後 3 年內保留。訂單記錄保留 7 年，以符合稅務及消費者權益法規。',
      },
      {
        title: '5. 您的權利',
        content: '根據《個人資料（私隱）條例》（第 486 章），您有權查閱、更正、刪除、限制處理及移轉您的個人資料。您亦有權反對某些處理方式，包括直接推廣。如欲行使任何此等權利，請透過電郵 privacy@cloth-hk.com 聯絡我們。我們將在 30 天內回覆您的請求。',
      },
      {
        title: '6. Cookie 及追蹤',
        content: '我們的網站使用 Cookie 及類似追蹤技術，以提升您的瀏覽體驗、分析網站流量及個人化內容。必要的 Cookie 為網站正常運作所需。分析及推廣 Cookie 需要您的同意，您可以隨時透過網站上的 Cookie 同意橫幅進行管理。',
      },
      {
        title: '7. 資料安全',
        content: '我們實施適當的技術及組織措施，保護您的個人資料免受未經授權的存取、更改、披露或銷毀。這包括傳輸中資料的 SSL/TLS 加密、静態資料的 AES-256 加密、定期安全審核，以及限制團隊成員存取個人資料的存取控制。',
      },
      {
        title: '8. 兒童隱私',
        content: '我們的網站和服務並非針對 18 歲以下人士。我們不會故意收集未成年人的個人資料。如果您認為我們在不知情的情況下收集了此類資訊，請立即聯絡我們，我們將採取措施刪除該資料。',
      },
      {
        title: '9. 跨境轉移',
        content: '請注意，如果您身在香港以外地區，您的資訊可能會被轉移至香港及可能擁有不同資料保護法律的其他國家/地區處理。當我們進行國際資料轉移時，我們確保採取適當的保障措施，例如個人資料私隱專員認可的標準合約條款。',
      },
      {
        title: '10. 政策變更',
        content: '我們可能不時更新本隱私政策，以反映我們的實踐或法律要求的變更。我們將通過在本頁發布更新政策及修訂的「最後更新」日期來通知您任何重大變更。在任何變更後繼續使用我們的服務，即表示您接受修訂後的政策。',
      },
    ],
    contactEmail: 'privacy@cloth-hk.com',
    contactTitle: '對本政策有疑問？',
    lastUpdated: '最後更新：2026年5月',
  },
  CN: {
    pageTitle: '隐私条款',
    pageSubtitle: '我们如何收集、使用和保护您的个人信息。',
    heroTitle: '您的隐私是我们首要考量',
    heroSubtitle: '我们致力于保护您的个人数据，并对如何使用它保持透明。',
    sections: [
      {
        title: '1. 我们收集的信息',
        content: '我们直接向您收集您主动提供的信息，例如建立账户、下单、订阅电子报或联系客服时。这包括您的姓名、电子邮箱、邮寄地址、电话号码、付款信息及订单记录。当您浏览我们的网站时，我们亦会自动收集某些技术信息，包括 IP 地址、浏览器类型、操作系统及在我们网站上的浏览行为。',
      },
      {
        title: '2. 我们如何使用您的信息',
        content: '我们使用收集到的信息来处理和履行您的订单、与您沟通您的购买和账户、在您同意的情况下向您发送市场推广信息、改善我们的网站和服务、检测及防止欺诈和滥用，以及履行我们的法律义务。我们绝不会将您的个人数据出售给第三方。',
      },
      {
        title: '3. 信息共享',
        content: '我们与可信赖的第三方服务供应商共享您的信息，以协助我们运营网站、处理付款、交付订单及执行业务。这包括付款处理商（如支付宝、微信支付）、物流合作伙伴（顺丰速运、DHL）、电子邮箱服务供应商及分析平台。所有相关方均须根据合同保障您的信息安全，并仅按我们指定的目的使用该信息。',
      },
      {
        title: '4. 数据保留',
        content: '我们保留您的个人数据，以实现本政策所述目的的必要时间，包括会计、法律合规及欺诈预防目的。账户数据在您的账户活跃期间及最后一次活动后 3 年内保留。订单记录保留 7 年，以符合税务及消费者权益法规。',
      },
      {
        title: '5. 您的权利',
        content: '根据《中华人民共和国个人信息保护法》，您有权查阅、更正、删除、限制处理及转移您的个人数据。您亦有权利反对某些处理方式，包括直接推广。如欲行使任何此等权利，请通过邮箱 privacy@cloth.cn 联系我们。我们将在 30 天内回复您的请求。',
      },
      {
        title: '6. Cookie 及追踪',
        content: '我们的网站使用 Cookie 及类似追踪技术，以提升您的浏览体验、分析网站流量及个性化内容。必要的 Cookie 为网站正常运行所需。分析及推广 Cookie 需要您的同意，您可以随时通过网站上的 Cookie 同意横幅进行管理。',
      },
      {
        title: '7. 数据安全',
        content: '我们实施适当的技术及组织措施，保护您的个人数据免受未经授权的访问、更改、披露或销毁。这包括传输中数据的 SSL/TLS 加密、静态数据的 AES-256 加密、定期安全审计，以及限制团队成员访问个人数据的访问控制。',
      },
      {
        title: '8. 儿童隐私',
        content: '我们的网站和服务并非针对 18 岁以下人士。我们不会故意收集未成年人的个人信息。如果您认为我们在不知情的情况下收集了此类信息，请立即联系我们，我们将采取措施删除该数据。',
      },
      {
        title: '9. 跨境传输',
        content: '请注意，如果您身在中国大陆以外地区，您的信息可能会被传输至中国大陆及可能拥有不同数据保护法律的其他国家/地区处理。当我们进行国际数据传输时，我们确保采取适当的保障措施，例如国家标准《个人信息跨境处理认证要求》规定的标准合同条款。',
      },
      {
        title: '10. 政策变更',
        content: '我们可能不时更新本隐私政策，以反映我们的实践或法律要求的变更。我们将通过在本页发布更新政策及修订的「最后更新」日期来通知您任何重大变更。在任何变更后继续使用我们的服务，即表示您接受修订后的政策。',
      },
    ],
    contactEmail: 'privacy@cloth.cn',
    contactTitle: '对本政策有疑问？',
    lastUpdated: '最后更新：2026年5月',
  },
};

export default function Privacy() {
  const lang = document.documentElement.lang?.startsWith('zh')
    ? (document.documentElement.lang === 'zh-HK' ? 'HK' : 'CN')
    : 'UK';
  const t = COPY[lang] ?? COPY.CN;

  const tocLabel = lang === 'UK' ? 'Contents' : lang === 'HK' ? '目錄' : '目录';

  return (
    <div className={styles.page} data-testid="privacy-page">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t.pageTitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
        </div>
      </section>

      <div className={styles.content}>
        {/* Table of contents */}
        <nav className={styles.toc} aria-label="Table of contents">
          <h2 className={styles.tocTitle}>{tocLabel}</h2>
          <ol className={styles.tocList}>
            {t.sections.map((s, i) => (
              <li key={i}>
                <a href={`#section-${i}`} className={styles.tocLink} data-testid={`privacy-toc-${i + 1}`}>
                  {s.title.replace(/^\d+\.\s*/, '')}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className={styles.sections}>
          {t.sections.map((s, i) => (
            <section key={i} id={`section-${i}`} className={styles.section} data-testid={`privacy-section-${i + 1}`}>
              <h2 className={styles.sectionTitle}>{s.title}</h2>
              <p className={styles.sectionBody}>{s.content}</p>
            </section>
          ))}
        </div>

        <hr className={styles.divider} />

        {/* Contact */}
        <section className={styles.contactBanner}>
          <div className={styles.contactBannerContent}>
            <h2 className={styles.contactBannerTitle}>{t.contactTitle}</h2>
            <p className={styles.contactBannerText}>
              <a href={`mailto:${t.contactEmail}`} data-testid="privacy-contact-email">
                {t.contactEmail}
              </a>
            </p>
          </div>
        </section>

        {/* Last updated */}
        <p className={styles.lastUpdated} data-testid="privacy-last-updated">{t.lastUpdated}</p>
      </div>
    </div>
  );
}
