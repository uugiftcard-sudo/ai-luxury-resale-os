/**
 * Support — 客服中心页面
 * Routes: /support, /hk/support, /cn/support
 */
import { useState } from 'react';
import { useMarket } from '../hooks/useMarket';
import { useSupport } from '../contexts/SupportContext';
import type { SupportTicketType, SupportTicketStatus } from '../types/support';
import styles from './Support.module.css';

// ── Copy config per market ─────────────────────────────────────────────────────
const COPY: Record<string, {
  pageTitle: string;
  pageSubtitle: string;
  tabs: { myTickets: string; newTicket: string; faq: string };
  orderSection: { title: string; placeholder: string; btn: string; noOrder: string };
  ticketForm: {
    title: string;
    typeLabel: string;
    subjectLabel: string;
    descLabel: string;
    orderIdLabel: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    submitBtn: string;
    successMsg: string;
  };
  faq: { title: string; };
  contact: { title: string; phone: string; email: string; hours: string };
  status: Record<SupportTicketStatus, string>;
  typeMap: Record<SupportTicketType, string>;
  priorityMap: Record<string, string>;
}> = {
  UK: {
    pageTitle: 'Customer Support',
    pageSubtitle: 'We\'re here to help — check your orders, raise after-sales requests, or browse FAQs.',
    tabs: { myTickets: 'My Tickets', newTicket: 'New Request', faq: 'FAQ' },
    orderSection: { title: 'Track Your Order', placeholder: 'Enter order number (e.g. CS20260520001)', btn: 'Search', noOrder: 'No order found.' },
    ticketForm: {
      title: 'Submit a Request',
      typeLabel: 'Request Type', subjectLabel: 'Subject', descLabel: 'Description',
      orderIdLabel: 'Order Number (optional)', nameLabel: 'Your Name', emailLabel: 'Email Address',
      phoneLabel: 'Phone Number (optional)', submitBtn: 'Submit Request', successMsg: 'Request submitted! Your ticket number: ',
    },
    faq: { title: 'Frequently Asked Questions' },
    contact: { title: 'Contact Us', phone: '+44 20 7946 0958', email: 'support@cloth-uk.com', hours: 'Mon–Fri 9:00–18:00 GMT' },
    status: { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' },
    typeMap: { inquiry: 'Order Inquiry', return: 'Return Request', exchange: 'Exchange Request', repair: 'Repair Request' },
    priorityMap: { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' },
  },
  HK: {
    pageTitle: '客戶服務中心',
    pageSubtitle: '查詢訂單、提交售後申請、瀏覽常見問題，全方位客戶服務。',
    tabs: { myTickets: '我的查詢', newTicket: '新建查詢', faq: '常見問題' },
    orderSection: { title: '追蹤訂單', placeholder: '輸入訂單編號', btn: '查詢', noOrder: '找不到相關訂單。' },
    ticketForm: {
      title: '提交售後申請',
      typeLabel: '申請類型', subjectLabel: '主題', descLabel: '詳細描述',
      orderIdLabel: '訂單編號（選填）', nameLabel: '姓名', emailLabel: '電郵地址',
      phoneLabel: '聯絡電話（選填）', submitBtn: '提交申請', successMsg: '申請已提交，您的工單編號：',
    },
    faq: { title: '常見問題 FAQ' },
    contact: { title: '聯絡我們', phone: '+852 2123 4567', email: 'support@cloth-hk.com', hours: '星期一至五 10:00–19:00' },
    status: { open: '待處理', in_progress: '處理中', resolved: '已解決', closed: '已關閉' },
    typeMap: { inquiry: '訂單查詢', return: '退貨申請', exchange: '換貨申請', repair: '維修申請' },
    priorityMap: { low: '低', normal: '一般', high: '高', urgent: '緊急' },
  },
  CN: {
    pageTitle: '客户服务中心',
    pageSubtitle: '查询订单、提交售后申请、浏览常见问题，全方位客户服务。',
    tabs: { myTickets: '我的查询', newTicket: '新建查询', faq: '常见问题' },
    orderSection: { title: '追踪订单', placeholder: '输入订单编号', btn: '查询', noOrder: '未找到相关订单。' },
    ticketForm: {
      title: '提交售后申请',
      typeLabel: '申请类型', subjectLabel: '主题', descLabel: '详细描述',
      orderIdLabel: '订单编号（选填）', nameLabel: '姓名', emailLabel: '电子邮箱',
      phoneLabel: '联系电话（选填）', submitBtn: '提交申请', successMsg: '申请已提交，您的工单编号：',
    },
    faq: { title: '常见问题 FAQ' },
    contact: { title: '联系我们', phone: '400-888-9999', email: 'support@cloth.cn', hours: '周一至周五 9:00–18:00' },
    status: { open: '待处理', in_progress: '处理中', resolved: '已解决', closed: '已关闭' },
    typeMap: { inquiry: '订单查询', return: '退货申请', exchange: '换货申请', repair: '维修申请' },
    priorityMap: { low: '低', normal: '一般', high: '高', urgent: '紧急' },
  },
};

const TICKET_TYPES: SupportTicketType[] = ['inquiry', 'return', 'exchange', 'repair'];

const FAQ_LIST = [
  { id: '1', q: 'CLOTH 如何保证商品是正品？', a: '我们所有商品均经过专业鉴定师鉴定，提供实物细节照片及鉴定报告。支持 7 天无理由退换（不影响二次销售）。', category: '正品保障' },
  { id: '2', q: '下单后多久发货？', a: '一般情况下，订单确认后 1-3 个工作日内发货。香港、澳门地区 2-5 个工作日。偏远地区可能需要更长时间。', category: '物流配送' },
  { id: '3', q: '如何申请退换货？', a: '请在收货后 7 天内提交退换申请。进入「我的查询」→ 点击「新建查询」→ 选择「退货申请」或「换货申请」，我们会尽快处理。', category: '退换货' },
  { id: '4', q: '商品有色差或瑕疵怎么办？', a: '如收到的商品与描述严重不符或存在未标注的瑕疵，请在收货后 24 小时内联系我们并提供照片证据，我们会为您安排退换。', category: '退换货' },
  { id: '5', q: '如何联系人工客服？', a: '工作时间可通过本页底部联系方式联系我们；非工作时间可提交工单，我们将在 24 小时内回复。', category: '其他' },
  { id: '6', q: '支持哪些支付方式？', a: '支持 Visa、Mastercard、PayPal、支付宝、微信支付、银行转账等多种支付方式。', category: '支付问题' },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status, label }: { status: SupportTicketStatus; label: string }) {
  const cls = status === 'open' ? styles.badgeOpen : status === 'in_progress' ? styles.badgeProgress : status === 'resolved' ? styles.badgeResolved : styles.badgeClosed;
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

function TicketCard({ ticket, t }: { ticket: import('../types/support').SupportTicket; t: typeof COPY.CN }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.ticketCard}>
      <div className={styles.ticketHeader} onClick={() => setOpen(o => !o)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}>
        <div className={styles.ticketMeta}>
          <span className={styles.ticketNo}>{ticket.ticketNo}</span>
          <span className={styles.ticketType}>{t.typeMap[ticket.type]}</span>
          <StatusBadge status={ticket.status} label={t.status[ticket.status]} />
          {ticket.priority === 'high' || ticket.priority === 'urgent' ? <span className={styles.priorityHigh}>⚠ {t.priorityMap[ticket.priority]}</span> : null}
        </div>
        <div className={styles.ticketSubjectRow}>
          <span className={styles.ticketSubject}>{ticket.subject}</span>
          <span className={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className={styles.ticketBody}>
          <p className={styles.ticketDesc}>{ticket.description}</p>
          {ticket.orderId && <p className={styles.ticketOrder}><strong>关联订单：</strong>{ticket.orderId}</p>}
          {ticket.adminReply && (
            <div className={styles.adminReply}>
              <strong>客服回复：</strong>{ticket.adminReply}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FAQAccordion({ faqs }: { faqs: typeof FAQ_LIST }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={styles.faqList}>
      {faqs.map(faq => (
        <div key={faq.id} className={`${styles.faqItem} ${open === faq.id ? styles.faqOpen : ''}`}>
          <button className={styles.faqQ} onClick={() => setOpen(id => id === faq.id ? null : faq.id)}>
            <span className={styles.faqCategory}>{faq.category}</span>
            <span>{faq.q}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.faqChevron} ${open === faq.id ? styles.chevronOpen : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open === faq.id && <p className={styles.faqA}>{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────
export default function Support() {
  const { market } = useMarket();
  const t = COPY[market] ?? COPY.CN;
  const { tickets, loading, createTicket } = useSupport();
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'faq'>('list');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResult, setOrderResult] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'inquiry' as SupportTicketType,
    subject: '',
    description: '',
    orderId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function validateForm() {
    const errs: Record<string, string> = {};
    if (!form.subject.trim()) errs.subject = '请填写主题';
    if (!form.description.trim()) errs.description = '请填写描述';
    if (!form.customerName.trim()) errs.customerName = '请填写姓名';
    if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = '请填写正确的邮箱';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const ticket = await createTicket(form);
      setSubmitted(ticket.ticketNo);
      setForm({ type: 'inquiry', subject: '', description: '', orderId: '', customerName: '', customerEmail: '', customerPhone: '' });
      setFormErrors({});
      setActiveTab('list');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOrderSearch() {
    if (!orderSearch.trim()) return;
    const found = tickets.find(t => t.orderId === orderSearch.trim() || t.ticketNo === orderSearch.trim());
    setOrderResult(found ? found.ticketNo : null);
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t.pageTitle}</h1>
        <p className={styles.heroSubtitle}>{t.pageSubtitle}</p>
      </div>

      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`} onClick={() => setActiveTab('list')}>
                {t.tabs.myTickets}
              </button>
              <button className={`${styles.tab} ${activeTab === 'new' ? styles.tabActive : ''}`} onClick={() => setActiveTab('new')}>
                {t.tabs.newTicket}
              </button>
              <button className={`${styles.tab} ${activeTab === 'faq' ? styles.tabActive : ''}`} onClick={() => setActiveTab('faq')}>
                {t.tabs.faq}
              </button>
            </div>

            {/* Tab: My Tickets */}
            {activeTab === 'list' && (
              <div className={styles.tabContent}>
                {/* Order search */}
                <div className={styles.orderSearchBox}>
                  <h3 className={styles.sectionTitle}>{t.orderSection.title}</h3>
                  <div className={styles.orderSearchRow}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder={t.orderSection.placeholder}
                      value={orderSearch}
                      onChange={e => { setOrderSearch(e.target.value); setOrderResult(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleOrderSearch()}
                    />
                    <button className={styles.btnPrimary} onClick={handleOrderSearch}>{t.orderSection.btn}</button>
                  </div>
                  {orderResult !== null && (
                    <p className={orderResult ? styles.orderFound : styles.orderNotFound}>
                      {orderResult ? `已找到工单：${orderResult}` : t.orderSection.noOrder}
                    </p>
                  )}
                </div>

                {/* Ticket list */}
                {loading ? (
                  <div className={styles.loading}>加载中...</div>
                ) : tickets.length === 0 ? (
                  <div className={styles.empty}>
                    <p>暂无客服记录</p>
                    <button className={styles.btnOutline} onClick={() => setActiveTab('new')}>{t.tabs.newTicket}</button>
                  </div>
                ) : (
                  <div className={styles.ticketList}>
                    {tickets.map(ticket => (
                      <TicketCard key={ticket.id} ticket={ticket} t={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: New Ticket */}
            {activeTab === 'new' && (
              <div className={styles.tabContent}>
                {submitted && (
                  <div className={styles.successBanner}>
                    ✅ {t.ticketForm.successMsg}<strong>{submitted}</strong>
                  </div>
                )}
                <form className={styles.form} onSubmit={handleSubmit}>
                  <h3 className={styles.sectionTitle}>{t.ticketForm.title}</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t.ticketForm.typeLabel}</label>
                    <select className={styles.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as SupportTicketType }))}>
                      {TICKET_TYPES.map(type => (
                        <option key={type} value={type}>{t.typeMap[type]}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t.ticketForm.subjectLabel} *</label>
                    <input type="text" className={`${styles.input} ${formErrors.subject ? styles.inputError : ''}`}
                      value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="请简述您的问题" />
                    {formErrors.subject && <span className={styles.error}>{formErrors.subject}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t.ticketForm.descLabel} *</label>
                    <textarea className={`${styles.textarea} ${formErrors.description ? styles.inputError : ''}`}
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="请详细描述您的问题" rows={4} />
                    {formErrors.description && <span className={styles.error}>{formErrors.description}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t.ticketForm.orderIdLabel}</label>
                    <input type="text" className={styles.input} value={form.orderId}
                      onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="CS20260520001" />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t.ticketForm.nameLabel} *</label>
                      <input type="text" className={`${styles.input} ${formErrors.customerName ? styles.inputError : ''}`}
                        value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
                      {formErrors.customerName && <span className={styles.error}>{formErrors.customerName}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t.ticketForm.emailLabel} *</label>
                      <input type="email" className={`${styles.input} ${formErrors.customerEmail ? styles.inputError : ''}`}
                        value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} />
                      {formErrors.customerEmail && <span className={styles.error}>{formErrors.customerEmail}</span>}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t.ticketForm.phoneLabel}</label>
                    <input type="tel" className={styles.input} value={form.customerPhone}
                      onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
                  </div>

                  <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                    {submitting ? '提交中...' : t.ticketForm.submitBtn}
                  </button>
                </form>
              </div>
            )}

            {/* Tab: FAQ */}
            {activeTab === 'faq' && (
              <div className={styles.tabContent}>
                <h3 className={styles.sectionTitle}>{t.faq.title}</h3>
                <FAQAccordion faqs={FAQ_LIST} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>{t.contact.title}</h3>
              <div className={styles.contactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.81-.81a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <a href={`tel:${t.contact.phone.replace(/-/g, '')}`}>{t.contact.phone}</a>
              </div>
              <div className={styles.contactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
              </div>
              <div className={styles.contactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{t.contact.hours}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
