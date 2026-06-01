/**
 * Authentication — Authentication Process page
 * Routes: /authentication, /hk/authentication, /cn/authentication
 */
import { Link } from 'react-router-dom';
import styles from './Authentication.module.css';

const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  stepsTitle: string;
  steps: { step: string; title: string; desc: string; detail: string }[];
  guaranteeTitle: string;
  guarantee: { icon: string; title: string; desc: string }[];
  brandsTitle: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  contact: { title: string; text: string; btn: string };
  cta: { title: string; text: string; btn: string };
}> = {
  UK: {
    pageTitle: 'Authentication Process',
    pageSubtitle: 'How we verify every piece in our collection.',
    heroTitle: 'Every Piece, Authenticated',
    heroSubtitle: 'Our multi-point verification process ensures every luxury item is 100% genuine before it reaches you.',
    intro: 'Luxury resale demands trust. That\'s why every single item in the CLOTH collection passes through our rigorous multi-point authentication process before listing. We combine expert human judgement with cutting-edge verification tools to deliver certainty — not probability.',
    stepsTitle: 'How It Works',
    steps: [
      {
        step: '01',
        title: 'Physical Inspection',
        desc: 'Every item undergoes a thorough hands-on inspection by one of our trained authenticators.',
        detail: 'We examine stitching, hardware, materials, labels, serial numbers, date codes, and construction quality against the brand\'s official manufacturing standards.',
      },
      {
        step: '02',
        title: 'Material Analysis',
        desc: 'We test materials using professional-grade tools and reference databases.',
        detail: 'Leather grain patterns, canvas weave density, metal alloy composition, and textile weave structure are all cross-referenced against known genuine samples and manufacturer specifications.',
      },
      {
        step: '03',
        title: 'Hardware & Trims Verification',
        desc: 'Every metallic component is scrutinised under magnification.',
        detail: 'Font style, engraving depth, patina consistency, screw types, and zip pull engravings are checked against authentic reference images from each brand\'s official archives.',
      },
      {
        step: '04',
        title: 'Serial & Date Code Check',
        desc: 'Authenticity codes are verified against brand databases where available.',
        detail: 'Serial numbers, production date codes, and factory stamps are cross-referenced with the brand\'s official records and internal authentication databases.',
      },
      {
        step: '05',
        title: 'Photography & Documentation',
        desc: 'Every passing item is photographed and logged in our secure authentication record.',
        detail: 'Detailed photographs, measurement data, and condition notes are stored with each item\'s record, creating a complete provenance trail from our vault to your door.',
      },
      {
        step: '06',
        title: 'Seal & Certificate',
        desc: 'Authenticated items receive a CLOTH authentication tag and certificate.',
        detail: 'Each item is sealed with a tamper-evident CLOTH authentication tag and includes a certificate of authenticity card with a unique verification code.',
      },
    ],
    guaranteeTitle: 'Our Authentication Guarantee',
    guarantee: [
      { icon: 'shield', title: 'Expert Team', desc: 'Our authenticators are trained by former brand specialists and have examined thousands of genuine luxury items.' },
      { icon: 'ruler', title: 'Precise Measurements', desc: 'Every dimension is recorded against official specifications — no approximation, no guesswork.' },
      { icon: 'eye', title: 'No Compromise', desc: 'Items that fail any single verification step are rejected outright. We never list uncertain pieces.' },
    ],
    brandsTitle: 'Brands We Authenticate',
    faqTitle: 'Common Questions',
    faq: [
      { q: 'Who verifies the items?', a: 'Our authentication team consists of trained specialists with backgrounds in luxury goods, including former brand retail staff and professional authenticators. Each team member completes extensive training before independently verifying items.' },
      { q: 'How do I verify my item\'s certificate?', a: 'Every certificate includes a unique verification code. You can enter this code on our verification page to confirm your item\'s authentication record. This record includes photographs, measurements, and the date of authentication.' },
      { q: 'Do you authenticate items I want to sell?', a: 'Yes! We offer authentication services for sellers. Items can be submitted through our seller portal and will be authenticated before any listing is published on our platform.' },
      { q: 'What happens if an item fails authentication?', a: 'Items that do not pass our authentication process are returned to the seller at their expense. We do not disclose specific reasons for authentication failures to protect against fraudsters learning our methods.' },
      { q: 'Do you use AI or technology in authentication?', a: 'We use technology as a supporting tool — including material analysis devices, high-resolution imaging, and reference databases. However, every final decision is made by a human expert.' },
    ],
    contact: {
      title: 'Have questions about our process?',
      text: 'Our team is happy to explain our authentication methods in detail.',
      btn: 'Contact Support',
    },
    cta: {
      title: 'Shop with confidence',
      text: 'Browse our collection of authenticated luxury pieces, every one guaranteed genuine.',
      btn: 'Shop Now',
    },
  },
  HK: {
    pageTitle: '正品保障流程',
    pageSubtitle: '了解我們如何驗證每件商品。',
    heroTitle: '每件精品，均經認證',
    heroSubtitle: '我們的多重驗證程序確保 CLOTH 平台上的每件奢侈品均為 100% 正品。',
    intro: '奢侈品二手交易建立在信任之上。正因如此，CLOTH 平台上的每件單品在上架前都必須通過我們嚴格的多重驗證程序。我們結合專業人員的豐富經驗與尖端驗證工具，提供確定性而非概率性的保障。',
    stepsTitle: '認證流程',
    steps: [
      {
        step: '01',
        title: '實物檢驗',
        desc: '每件商品均經我們專業訓練的鑑定師進行全面觸控及視覺檢驗。',
        detail: '我們根據各品牌官方製造標準，仔細檢查縫線、五金、配料、標籤、序號、日期碼及做工品質。',
      },
      {
        step: '02',
        title: '用料分析',
        desc: '使用專業工具及參考數據庫測試材料。',
        detail: '皮革紋理、帆布密度、金屬合金成分及紡織品結構均與已知正品樣本及品牌規格進行交叉比對。',
      },
      {
        step: '03',
        title: '五金及配件驗證',
        desc: '所有金屬部件均在放大鏡下仔細檢查。',
        detail: '字體風格、雕刻深度、氧化程度、螺絲類型及拉鏈拉片雕刻均與各品牌官方存檔中的正品參考圖片進行比對。',
      },
      {
        step: '04',
        title: '序號及日期碼核查',
        desc: '驗證真偽碼與品牌數據庫（如有）進行比對。',
        detail: '序號、生產日期碼及工廠印章均與品牌官方記錄及內部驗證數據庫進行交叉比對。',
      },
      {
        step: '05',
        title: '拍攝及記錄存檔',
        desc: '每件通過的商品均會拍攝並記錄在我們的安全驗證系統中。',
        detail: '詳細照片、測量數據及成色記錄會與每件商品的檔案一起保存，從我們的庫房到您手中創建完整的來源追蹤記錄。',
      },
      {
        step: '06',
        title: '封籤及證書',
        desc: '通過驗證的商品將獲得 CLOTH 正品封籤及正品保證書。',
        detail: '每件商品均附有 CLOTH 防篡改正品封籤，並包含一張附有唯一驗證碼的正品保證卡。',
      },
    ],
    guaranteeTitle: '我們的正品保障承諾',
    guarantee: [
      { icon: 'shield', title: '專業團隊', desc: '我們的鑑定師由前品牌專員培訓，曾檢驗過數以千計的正品奢侈品。' },
      { icon: 'ruler', title: '精準測量', desc: '每項尺寸均根據官方規格記錄——絕不近似、不猜測。' },
      { icon: 'eye', title: '絕不妥協', desc: '任何一個驗證步驟未通過的商品將被直接拒絕。我們絕不上架任何存疑商品。' },
    ],
    brandsTitle: '我們驗證的品牌',
    faqTitle: '常見問題',
    faq: [
      { q: '誰負責驗證商品？', a: '我們的驗證團隊由奢侈品領域的專業人士組成，包括前品牌零售人員及專業鑑定師。每位團隊成員在獨立驗證商品前均需完成嚴格培訓。' },
      { q: '如何驗證我商品的正品證書？', a: '每張正品證書均包含唯一的驗證碼。您可在我們的驗證頁面輸入此驗證碼，確認您商品的正品記錄。該記錄包含照片、尺寸及驗證日期。' },
      { q: '你們有驗證我想要出售的商品嗎？', a: '有的！我們為賣家提供驗證服務。商品可通過我們的賣家入口提交，在我們平台上發布任何上架資訊前，商品都會先通過正品驗證。' },
      { q: '如果商品驗證失敗會怎樣？', a: '未通過我們驗證程序的商品將由賣家自費退回。我們不會透露驗證失敗的具體原因，以保護我們的驗證方法不被欺詐者學習。' },
      { q: '你們在驗證過程中使用人工智能或科技嗎？', a: '我們使用科技作為輔助工具，包括材料分析設備、高解析度影像及參考數據庫。然而，每個最終決定均由專業人員作出。' },
    ],
    contact: {
      title: '對我們的流程有疑問？',
      text: '我們的團隊樂意詳細解釋我們的驗證方法。',
      btn: '聯絡客服',
    },
    cta: {
      title: '安心選購',
      text: '瀏覽我們的認證奢品系列，每件均保證為正品。',
      btn: '立即選購',
    },
  },
  CN: {
    pageTitle: '正品保障流程',
    pageSubtitle: '了解我们如何验证每件商品。',
    heroTitle: '每件精品，均经认证',
    heroSubtitle: '我们的多重验证程序确保 CLOTH 平台上的每件奢侈品均为 100% 正品。',
    intro: '奢侈品二手交易建立在信任之上。正因如此，CLOTH 平台上的每件单品在上架前都必须通过我们严格的多重验证程序。我们结合专业人员的丰富经验与尖端验证工具，提供确定性而非概率性的保障。',
    stepsTitle: '认证流程',
    steps: [
      {
        step: '01',
        title: '实物检验',
        desc: '每件商品均经我们专业训练的鉴定师进行全面的触控及视觉检验。',
        detail: '我们根据各品牌官方制造标准，仔细检查缝线、五金、面料、标签、序号、生产日期码及做工品质。',
      },
      {
        step: '02',
        title: '用料分析',
        desc: '使用专业工具及参考数据库测试材料。',
        detail: '皮革纹理、帆布密度、金属合金成分及纺织品结构均与已知正品样本及品牌规格进行交叉比对。',
      },
      {
        step: '03',
        title: '五金及配件验证',
        desc: '所有金属部件均在放大镜下仔细检查。',
        detail: '字体风格、雕刻深度、氧化程度、螺丝类型及拉链拉片雕刻均与各品牌官方存档中的正品参考图片进行比对。',
      },
      {
        step: '04',
        title: '序号及日期码核查',
        desc: '验证编码与品牌数据库（如有）进行比对。',
        detail: '序号、生产日期码及工厂印章均与品牌官方记录及内部验证数据库进行交叉比对。',
      },
      {
        step: '05',
        title: '拍摄及记录存档',
        desc: '每件通过的商品均会拍摄并记录在我们的安全验证系统中。',
        detail: '详细照片、测量数据及成色记录会与每件商品的档案一起保存，从我们的库房到您手中创建完整的来源追踪记录。',
      },
      {
        step: '06',
        title: '封签及证书',
        desc: '通过验证的商品将获得 CLOTH 正品封签及正品保证书。',
        detail: '每件商品均附有 CLOTH 防篡改正品封签，并包含一张附有唯一验证码的正品保证卡。',
      },
    ],
    guaranteeTitle: '我们的正品保障承诺',
    guarantee: [
      { icon: 'shield', title: '专业团队', desc: '我们的鉴定师由前品牌专员培训，曾检验过数以千计的正品奢侈品。' },
      { icon: 'ruler', title: '精准测量', desc: '每项尺寸均根据官方规格记录——绝不近似、不猜测。' },
      { icon: 'eye', title: '绝不妥协', desc: '任何一个验证步骤未通过的商品将被直接拒绝。我们绝不上架任何存疑商品。' },
    ],
    brandsTitle: '我们验证的品牌',
    faqTitle: '常见问题',
    faq: [
      { q: '谁负责验证商品？', a: '我们的验证团队由奢侈品领域的专业人士组成，包括前品牌零售人员及专业鉴定师。每位团队成员在独立验证商品前均需完成严格培训。' },
      { q: '如何验证我商品的正品证书？', a: '每张正品证书均包含唯一的验证码。您可在我们的验证页面输入此验证码，确认您商品的正品记录。该记录包含照片、尺寸及验证日期。' },
      { q: '你们有验证我想要出售的商品吗？', a: '有的！我们为卖家提供验证服务。商品可通过我们的卖家入口提交，在我们平台上发布任何上架信息前，商品都会先通过正品验证。' },
      { q: '如果商品验证失败会怎样？', a: '未通过我们验证程序的商品将由卖家自费退回。我们不会透露验证失败的具体原因，以保护我们的验证方法不被欺诈者学习。' },
      { q: '你们在验证过程中使用人工智能或科技吗？', a: '我们使用科技作为辅助工具，包括材料分析设备、高分辨率影像及参考数据库。然而，每个最终决定均由专业人员作出。' },
    ],
    contact: {
      title: '对我们的流程有疑问？',
      text: '我们的团队乐意详细解释我们的验证方法。',
      btn: '联系客服',
    },
    cta: {
      title: '安心选购',
      text: '浏览我们的认证奢品系列，每件均保证为正品。',
      btn: '立即选购',
    },
  },
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  ruler: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21.21 15.89A10 10 0 118 2.83"/>
      <path d="M22 12A10 10 0 0012 2v10z"/>
    </svg>
  ),
  eye: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};

export default function Authentication() {
  const lang = document.documentElement.lang?.startsWith('zh') ? (document.documentElement.lang === 'zh-HK' ? 'HK' : 'CN') : 'UK';
  const t = COPY[lang] ?? COPY.CN;

  const marketPrefix = lang === 'UK' ? '' : `/${lang.toLowerCase()}`;

  return (
    <div className={styles.page} data-testid="authentication-page">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t.pageTitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
        </div>
      </section>

      <div className={styles.content}>
        {/* Intro */}
        <div className={styles.introBlock}>
          <p className={styles.introText}>{t.intro}</p>
        </div>

        {/* Steps */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.stepsTitle}</h2>
          <div className={styles.stepsList}>
            {t.steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                  <p className={styles.stepDetail}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Guarantee */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleCentered}>{t.guaranteeTitle}</h2>
          <div className={styles.guaranteeGrid}>
            {t.guarantee.map((g, i) => (
              <div key={i} className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>{ICONS[g.icon] ?? ICONS.shield}</div>
                <h3 className={styles.guaranteeTitle}>{g.title}</h3>
                <p className={styles.guaranteeDesc}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Brands */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleCentered}>{t.brandsTitle}</h2>
          <div className={styles.brandsRow}>
            {['Gucci', 'Chanel', 'Louis Vuitton', 'Hermès', 'Prada', 'Balenciaga', 'Dior', 'Bottega Veneta'].map(b => (
              <span key={b} className={styles.brandBadge}>{b}</span>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleCentered}>{t.faqTitle}</h2>
          <div className={styles.faqList}>
            {t.faq.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{item.q}</h3>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Contact */}
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

        {/* CTA */}
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
