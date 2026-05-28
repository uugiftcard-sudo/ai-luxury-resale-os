/**
 * About — About Us page
 * Routes: /about, /hk/about, /cn/about
 */
import styles from './About.module.css';

const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionText: string;
  storyTitle: string;
  storyText: string;
  valuesTitle: string;
  values: { title: string; desc: string }[];
  teamTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaBtn: string;
}> = {
  UK: {
    pageTitle: 'About Us',
    pageSubtitle: 'Who we are, what we believe, and why pre-loved luxury is the future.',
    heroTitle: 'Authenticated Pre-Loved Luxury',
    heroSubtitle: 'Every piece tells a story. We make sure it\'s a genuine one.',
    missionTitle: 'Our Mission',
    missionText: 'We founded CLOTH with a simple belief: luxury should be accessible, sustainable, and always authentic. Every item in our collection is hand-picked and rigorously authenticated by our expert team — because peace of mind isn\'t optional when you\'re investing in something beautiful.',
    storyTitle: 'Our Story',
    storyText: 'What started as a passion for pre-loved fashion grew into a mission to change how the world thinks about luxury. We saw beautiful pieces sitting unworn in wardrobes, while others longed for them. CLOTH bridges that gap — connecting sellers and buyers in a trusted, curated space.',
    valuesTitle: 'Our Values',
    values: [
      { title: 'Authenticity First', desc: 'Every single item passes through our multi-point authentication process before it reaches you.' },
      { title: 'Sustainability by Design', desc: 'Choosing pre-loved extends the life of luxury goods and reduces fashion waste — one of the most polluting industries in the world.' },
      { title: 'Curated, Not Volume', desc: 'We prioritise quality over quantity. Each piece is personally selected by our team, never mass-listed.' },
      { title: 'Transparent Pricing', desc: 'Fair value for both sellers and buyers. No hidden fees, no inflated markups.' },
    ],
    teamTitle: 'The CLOTH Team',
    ctaTitle: 'Ready to explore?',
    ctaText: 'Browse our full collection of authenticated luxury pieces.',
    ctaBtn: 'Shop Now',
  },
  HK: {
    pageTitle: '關於我們',
    pageSubtitle: '了解 CLOTH 的理念、團隊與使命。',
    heroTitle: '認證奢品平台',
    heroSubtitle: '每一件精品，都承載一個故事。我們確保它是真實的。',
    missionTitle: '我們的使命',
    missionText: 'CLOTH 成立於一個簡單的信念：奢品應該觸手可及、可持續，並始终確保正品。每件商品在進入我們的收藏前，都會經過專家團隊的嚴格鑑定——因為當您投資美麗的事物時，心安理得並非選項，而是必備。',
    storyTitle: '我們的故事',
    storyText: '從對二手時尚的熱愛，到改變世界對奢品看法的使命，CLOTH 就此誕生。我們看到美麗的單品在衣櫃裡閒置，而許多人卻渴望擁有它們。CLOTH 橋接了這道鴻溝——在一個值得信賴的精心策劃空間中，連接買家與賣家。',
    valuesTitle: '我們的價值',
    values: [
      { title: '正品保障優先', desc: '每件商品在送達您手中前，都會通過我們的多重認證流程。' },
      { title: '可持續發展理念', desc: '選擇二手精品可延長奢品的生命週期，減少時尚產業的浪費——這是世上污染最嚴重的產業之一。' },
      { title: '精挑細選而非海量上架', desc: '我們注重品質而非數量。每件單品均由團隊親自挑選，绝不批量上架。' },
      { title: '透明定價', desc: '為賣家和買家提供公允價值。無隱藏費用，無虛高標價。' },
    ],
    teamTitle: 'CLOTH 團隊',
    ctaTitle: '準備好探索了嗎？',
    ctaText: '瀏覽我們完整的認證奢品系列。',
    ctaBtn: '立即選購',
  },
  CN: {
    pageTitle: '关于我们',
    pageSubtitle: '了解 CLOTH 的理念、团队与使命。',
    heroTitle: '认证奢品平台',
    heroSubtitle: '每一件精品，都承载一个故事。我们确保它是真实的。',
    missionTitle: '我们的使命',
    missionText: 'CLOTH 创立于一个简单的信念：奢品应该触手可及、可持续，并始终确保正品。每件商品在进入我们的收藏前，都会经过专家团队的严格鉴定——因为当您投资美丽的事物时，心安理得并非选项，而是必备。',
    storyTitle: '我们的故事',
    storyText: '从对二手时尚的热爱，到改变世界对奢品看法的使命，CLOTH 就此诞生。我们看到美丽的单品在衣柜里闲置，而许多人却渴望拥有它们。CLOTH 桥接了这道鸿沟——在一个值得信赖的精心策划空间中，连接买家与卖家。',
    valuesTitle: '我们的价值观',
    values: [
      { title: '正品保障优先', desc: '每件商品在送达您手中前，都会通过我们的多重认证流程。' },
      { title: '可持续发展理念', desc: '选择二手精品可延长奢品的生命周期，减少时尚产业的浪费——这是世上污染最严重的产业之一。' },
      { title: '精挑细选而非海量上架', desc: '我们注重品质而非数量。每件单品均由团队亲自挑选，绝不批量上架。' },
      { title: '透明定价', desc: '为卖家和买家提供公允价值。无隐藏费用，无虚高标价。' },
    ],
    teamTitle: 'CLOTH 团队',
    ctaTitle: '准备好探索了吗？',
    ctaText: '浏览我们完整的认证奢品系列。',
    ctaBtn: '立即选购',
  },
};

export default function About() {
  const lang = document.documentElement.lang?.startsWith('zh') ? (document.documentElement.lang === 'zh-HK' ? 'HK' : 'CN') : 'UK';
  const t = COPY[lang] ?? COPY.CN;

  return (
    <div className={styles.page} data-testid="about-page">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t.pageTitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
        </div>
      </section>

      <div className={styles.content}>
        {/* Mission */}
        <section className={styles.section}>
          <div className={styles.sectionGrid}>
            <div className={styles.sectionText}>
              <h2 className={styles.sectionTitle}>{t.missionTitle}</h2>
              <p className={styles.body}>{t.missionText}</p>
            </div>
            <div className={styles.sectionImage}>
              <div className={styles.imagePlaceholder} data-testid="about-mission-image">
                <span>Mission</span>
              </div>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Story */}
        <section className={styles.section}>
          <div className={styles.sectionGridReverse}>
            <div className={styles.sectionText}>
              <h2 className={styles.sectionTitle}>{t.storyTitle}</h2>
              <p className={styles.body}>{t.storyText}</p>
            </div>
            <div className={styles.sectionImage}>
              <div className={styles.imagePlaceholder} data-testid="about-story-image">
                <span>Story</span>
              </div>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Values */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleCentered}>{t.valuesTitle}</h2>
          <div className={styles.valuesGrid}>
            {t.values.map((v, i) => (
              <div key={i} className={styles.valueCard} data-testid={`about-value-${i + 1}`}>
                <div className={styles.valueIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className={styles.divider} />

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
          <p className={styles.ctaText}>{t.ctaText}</p>
          <a href={lang === 'UK' ? '/products' : `/${lang.toLowerCase()}/products`} className={styles.ctaBtn} data-testid="about-shop-cta">
            {t.ctaBtn}
          </a>
        </section>
      </div>
    </div>
  );
}
