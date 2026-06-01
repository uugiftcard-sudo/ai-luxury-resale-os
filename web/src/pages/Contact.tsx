/**
 * Contact — Contact page with a contact form
 * Routes: /contact, /hk/contact, /cn/contact
 */
import { useState } from 'react';
import { useToast } from '../hooks/useToast';
import styles from './Contact.module.css';

const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  heroTitle: string;
  formTitle: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  subjectLabel: string;
  messageLabel: string;
  orderLabel: string;
  submitBtn: string;
  submitting: string;
  successTitle: string;
  successText: string;
  infoTitle: string;
  info: { icon: string; label: string; value: string }[];
  note: string;
  errors: { name: string; email: string; subject: string; message: string };
}> = {
  UK: {
    pageTitle: 'Contact Us',
    pageSubtitle: 'Get in touch — we\'d love to hear from you.',
    heroTitle: 'We\'re here to help',
    formTitle: 'Send us a message',
    nameLabel: 'Your Name',
    emailLabel: 'Email Address',
    phoneLabel: 'Phone Number (optional)',
    subjectLabel: 'Subject',
    messageLabel: 'Message',
    orderLabel: 'Related Order Number (optional)',
    submitBtn: 'Send Message',
    submitting: 'Sending...',
    successTitle: 'Message sent!',
    successText: 'Thank you for reaching out. We\'ll get back to you within 1–2 business days.',
    infoTitle: 'Other ways to reach us',
    info: [
      { icon: 'phone', label: 'Phone', value: '+44 20 7946 0958' },
      { icon: 'email', label: 'Email', value: 'hello@cloth-uk.com' },
      { icon: 'clock', label: 'Hours', value: 'Mon–Fri 9:00–18:00 GMT' },
    ],
    note: 'For order tracking and after-sales requests, please use our Support Centre.',
    errors: { name: 'Please enter your name', email: 'Please enter a valid email address', subject: 'Please enter a subject', message: 'Please enter your message' },
  },
  HK: {
    pageTitle: '聯絡我們',
    pageSubtitle: '與我們聯繫——期待聽到您的聲音。',
    heroTitle: '竭誠為您服務',
    formTitle: '發送訊息',
    nameLabel: '姓名',
    emailLabel: '電郵地址',
    phoneLabel: '聯絡電話（選填）',
    subjectLabel: '主題',
    messageLabel: '訊息內容',
    orderLabel: '關聯訂單編號（選填）',
    submitBtn: '發送訊息',
    submitting: '發送中...',
    successTitle: '訊息已發送！',
    successText: '感謝您的來信，我們將在 1–2 個工作天內回覆您。',
    infoTitle: '其他聯絡方式',
    info: [
      { icon: 'phone', label: '電話', value: '+852 2123 4567' },
      { icon: 'email', label: '電郵', value: 'hello@cloth-hk.com' },
      { icon: 'clock', label: '辦公時間', value: '星期一至五 10:00–19:00' },
    ],
    note: '如需訂單追蹤或售後服務，請前往客戶服務中心。',
    errors: { name: '請填寫姓名', email: '請填寫有效的電郵地址', subject: '請填寫主題', message: '請填寫訊息內容' },
  },
  CN: {
    pageTitle: '联系我们',
    pageSubtitle: '期待听到您的声音，随时与我们联系。',
    heroTitle: '竭诚为您服务',
    formTitle: '发送消息',
    nameLabel: '姓名',
    emailLabel: '电子邮箱',
    phoneLabel: '联系电话（选填）',
    subjectLabel: '主题',
    messageLabel: '留言内容',
    orderLabel: '关联订单编号（选填）',
    submitBtn: '发送消息',
    submitting: '发送中...',
    successTitle: '消息已发送！',
    successText: '感谢您的来信，我们将在 1–2 个工作日内回复您。',
    infoTitle: '其他联系方式',
    info: [
      { icon: 'phone', label: '电话', value: '400-888-9999' },
      { icon: 'email', label: '邮箱', value: 'hello@cloth.cn' },
      { icon: 'clock', label: '办公时间', value: '周一至周五 9:00–18:00' },
    ],
    note: '如需订单追踪或售后服务，请前往客户服务中心。',
    errors: { name: '请填写姓名', email: '请填写有效的电子邮箱', subject: '请填写主题', message: '请填写留言内容' },
  },
};

const SUBJECTS: Record<string, string[]> = {
  UK: ['General Inquiry', 'Partnership', 'Seller Enquiry', 'Press & Media', 'Other'],
  HK: ['一般查詢', '合作夥伴', '賣家查詢', '媒體採訪', '其他'],
  CN: ['一般咨询', '合作伙伴', '卖家咨询', '媒体采访', '其他'],
};

const ICONS: Record<string, React.ReactNode> = {
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.81-.81a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

export default function Contact() {
  const lang = document.documentElement.lang?.startsWith('zh') ? (document.documentElement.lang === 'zh-HK' ? 'HK' : 'CN') : 'UK';
  const t = COPY[lang] ?? COPY.CN;
  const subjects = SUBJECTS[lang] ?? SUBJECTS.CN;
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: subjects[0],
    message: '',
    orderId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.errors.name;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.errors.email;
    if (!form.subject.trim()) errs.subject = t.errors.subject;
    if (!form.message.trim()) errs.message = t.errors.message;
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'inquiry',
          subject: form.subject,
          description: form.message + (form.orderId ? `\n\n关联订单：${form.orderId}` : ''),
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSent(true);
        showToast(t.successTitle, 'success');
      } else {
        showToast(json.error ?? '提交失败，请重试', 'error');
      }
    } catch {
      showToast('网络错误，请重试', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.page} data-testid="contact-page">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>{t.pageTitle}</span>
            <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          </div>
        </section>
        <div className={styles.content}>
          <div className={styles.successCard} data-testid="contact-success">
            <div className={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.successTitle}>{t.successTitle}</h2>
            <p className={styles.successText}>{t.successText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="contact-page">
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{t.pageTitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.pageSubtitle}</p>
        </div>
      </section>

      <div className={styles.content}>
        <div className={styles.layout}>
          {/* Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{t.formTitle}</h2>
            <form onSubmit={handleSubmit} noValidate data-testid="contact-form">
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.nameLabel} *</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                    placeholder="林小明"
                    data-testid="contact-name"
                  />
                  {errors.name && <span className={styles.error} data-testid="contact-name-error">{errors.name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.emailLabel} *</label>
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={form.email}
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                    placeholder="hello@example.com"
                    data-testid="contact-email"
                  />
                  {errors.email && <span className={styles.error} data-testid="contact-email-error">{errors.email}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.phoneLabel}</label>
                  <input
                    type="tel"
                    className={styles.input}
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+852 1234 5678"
                    data-testid="contact-phone"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.subjectLabel} *</label>
                  <select
                    className={`${styles.select} ${errors.subject ? styles.inputError : ''}`}
                    value={form.subject}
                    onChange={e => { setForm(f => ({ ...f, subject: e.target.value })); setErrors(er => ({ ...er, subject: '' })); }}
                    data-testid="contact-subject"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <span className={styles.error} data-testid="contact-subject-error">{errors.subject}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t.messageLabel} *</label>
                <textarea
                  className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                  value={form.message}
                  onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: '' })); }}
                  placeholder={lang === 'UK' ? 'How can we help you?' : '请描述您的需求...'}
                  rows={5}
                  data-testid="contact-message"
                />
                {errors.message && <span className={styles.error} data-testid="contact-message-error">{errors.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t.orderLabel}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.orderId}
                  onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                  placeholder="CS20260520001"
                  data-testid="contact-order"
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={submitting} data-testid="contact-submit">
                {submitting ? (
                  <span className={styles.spinner} aria-label={t.submitting} />
                ) : t.submitBtn}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>{t.infoTitle}</h3>
              {t.info.map((item, i) => (
                <div key={i} className={styles.infoItem}>
                  <span className={styles.infoIcon}>{ICONS[item.icon]}</span>
                  <div>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.infoValue}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className={styles.note}>{t.note}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
