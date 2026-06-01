/**
 * Privacy Policy page — static content, market-aware language
 */
import { useMarket } from '../hooks/useMarket';

export default function PrivacyPolicy() {
  const { market } = useMarket();
  const isEn = market === 'UK';

  return (
    <div className="page container" style={{ maxWidth: 780, padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{isEn ? 'Privacy Policy' : '隱私政策'}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {isEn ? 'Last updated: June 2026' : '最後更新：2026年6月'}
      </p>

      {isEn ? (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your name, email address, and order details when you register or make a purchase.</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. How We Use Your Information</h2>
            <p>We use your information to process orders, send order confirmations, provide customer support, and improve our services.</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>3. Data Security</h2>
            <p>We take reasonable measures to protect your personal information. All data is encrypted in transit using TLS.</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via the Support page.</p>
          </section>
        </>
      ) : (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>1. 我們收集的資料</h2>
            <p>我們收集您直接提供的資料，例如您在註冊或購物時填寫的姓名、電郵地址及訂單詳情。</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>2. 資料使用方式</h2>
            <p>我們使用您的資料來處理訂單、發送確認通知、提供客戶服務及改善我們的服務。</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>3. 資料安全</h2>
            <p>我們採取合理措施保護您的個人資料，所有傳輸資料均以 TLS 加密。</p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>4. 聯絡我們</h2>
            <p>如您對本隱私政策有任何疑問，請透過客服頁面聯絡我們。</p>
          </section>
        </>
      )}
    </div>
  );
}
