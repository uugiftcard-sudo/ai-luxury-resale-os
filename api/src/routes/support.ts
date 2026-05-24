/**
 * CLOTH 客服支持 API 路由
 * 提供工单管理、消息对话、FAQ 接口
 */
import { Router, Request, Response } from 'express';
import { ok, notFound, serverError } from '../middleware/response';

const router = Router();

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
type TicketType = 'inquiry' | 'return' | 'exchange' | 'repair';
type MessageAuthor = 'customer' | 'agent';

interface SupportTicket {
  id: string;
  ticketNo: string;
  type: TicketType;
  status: TicketStatus;
  subject: string;
  description: string;
  orderId?: string;
  priority: TicketPriority;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

interface SupportMessage {
  id: string;
  ticketId: string;
  author: MessageAuthor;
  authorName: string;
  message: string;
  createdAt: string;
}

interface SupportFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
}

const tickets: SupportTicket[] = [
  {
    id: 'st001',
    ticketNo: 'TKT-2024-001',
    type: 'inquiry',
    status: 'in_progress',
    subject: 'Gucci Marmont 包袋尺码咨询',
    description: '请问这款 Gucci Marmont 链条包的尺寸是多少？适合日常通勤使用吗？内里有几个隔层？',
    priority: 'normal',
    customerName: '张小明',
    customerEmail: 'zhangxm@email.com',
    customerPhone: '13812345678',
    adminReply: '您好！感谢您的咨询。Gucci GG Marmont Mini 尺寸为：宽 22cm × 高 13cm × 深 6cm。链条肩带约 58cm（单肩）/ 90cm（斜挎）。内里有 1 个主隔层 + 1 个贴袋，非常适合日常通勤使用。',
    createdAt: '2024-01-24T14:00:00Z',
    updatedAt: '2024-01-24T15:30:00Z',
  },
  {
    id: 'st002',
    ticketNo: 'TKT-2024-002',
    type: 'return',
    status: 'open',
    subject: 'Hermès Birkin 需要申请退货',
    description: '购买的爱马仕铂金包，收到后发现皮质颜色与图片有差异，请问可以申请退货吗？',
    priority: 'high',
    customerName: '李婷婷',
    customerEmail: 'litt@email.com',
    orderId: 'o002',
    createdAt: '2024-01-27T10:00:00Z',
  },
  {
    id: 'st003',
    ticketNo: 'TKT-2024-003',
    type: 'exchange',
    status: 'resolved',
    subject: 'Prada 三角包尺码调换咨询',
    description: '请问 Prada Re-Edition 2005 三角包是否可以调换成大号？',
    priority: 'low',
    customerName: '王芳',
    customerEmail: 'wangf@email.com',
    adminReply: '您好！目前暂无大号库存，但我们可以为您保留小号，并优先通知您下次补货情况。同时我们提供 7 天无理由退换服务。',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
  },
];

const messages: SupportMessage[] = [
  {
    id: 'sm001',
    ticketId: 'st001',
    author: 'customer',
    authorName: '张小明',
    message: '请问这款 Gucci Marmont 链条包的尺寸是多少？适合日常通勤使用吗？内里有几个隔层？',
    createdAt: '2024-01-24T14:00:00Z',
  },
  {
    id: 'sm002',
    ticketId: 'st001',
    author: 'agent',
    authorName: 'CLOTH 客服',
    message: '您好！感谢您的咨询。Gucci GG Marmont Mini 尺寸为：宽 22cm × 高 13cm × 深 6cm。链条肩带约 58cm（单肩）/ 90cm（斜挎）。内里有 1 个主隔层 + 1 个贴袋，非常适合日常通勤使用。',
    createdAt: '2024-01-24T15:30:00Z',
  },
  {
    id: 'sm003',
    ticketId: 'st002',
    author: 'customer',
    authorName: '李婷婷',
    message: '购买的爱马仕铂金包，收到后发现皮质颜色与图片有差异，请问可以申请退货吗？',
    createdAt: '2024-01-27T10:00:00Z',
  },
];

const faqs: SupportFAQ[] = [
  {
    id: 'faq001',
    question: '二手奢侈品成色如何定义？',
    answer: '我们使用四个等级：全新（未使用，配件齐全）、几乎全新（试用/试穿一次，外观无瑕疵）、轻微使用痕迹（日常使用，成色好，无明显破损）、有明显使用痕迹（使用频率较高，有明显瑕疵但在描述中已标注）。每个商品页面均会展示详细成色描述和实拍照片。',
    category: '商品说明',
    orderIndex: 1,
  },
  {
    id: 'faq002',
    question: '如何确认商品是正品？',
    answer: '所有商品在上架前均经过专业鉴定团队检查。我们提供：1) 购买小票/收据复印件（如有）；2) 专业鉴定证书（部分高价值商品）；3) 高清细节照片（序列号、品牌标识、五金件）；4) Vinted/Depop/Vestiaire 等平台验证记录。如需独立第三方鉴定，我们可以推荐专业机构。',
    category: '正品保障',
    orderIndex: 2,
  },
  {
    id: 'faq003',
    question: '退货政策是什么？',
    answer: '我们提供 7 天无理由退货（奢侈品定制商品除外）。退货条件：商品未使用、配件齐全、状态与描述一致。退货流程：在订单页面申请退货 → 客服审核 → 收到退货物品 → 退款处理（3-5 个工作日）。退货运费由买家承担（除非是描述不符或质量问题）。',
    category: '退货政策',
    orderIndex: 3,
  },
  {
    id: 'faq004',
    question: '国际运费如何计算？',
    answer: '中国内地：顺丰/京东快递 ¥15-30（视地区而定）；英国：DPD/Hermes £6-12；香港：顺丰HK ¥25-40。购满 ¥3,000 / £300 / HK$3,000 可享免费标准配送。偏远地区和岛屿可能会有附加费。',
    category: '物流配送',
    orderIndex: 4,
  },
  {
    id: 'faq005',
    question: '支持哪些付款方式？',
    answer: '中国大陆：支付宝、微信支付、银行转账；英国：Visa、Mastercard、American Express、PayPal；香港：FPS 转账、PayMe、信用卡。我们使用 Stripe 和 PayPal 作为支付网关，您的支付信息安全加密，不会存储在我们的服务器上。',
    category: '支付方式',
    orderIndex: 5,
  },
  {
    id: 'faq006',
    question: '订单多久发货？',
    answer: '我们承诺在确认付款后 1-3 个工作日内发货。高峰期（节假日）可能会有 1-2 天延迟。所有商品在发货前会拍摄打包照片并提供追踪号码。您可以在"我的订单"页面实时查看订单状态。',
    category: '物流配送',
    orderIndex: 6,
  },
];

let ticketIdCounter = 4;
let msgIdCounter = 10;
let faqIdCounter = 10;

function generateTicketId(): string { return `st${String(ticketIdCounter++).padStart(3, '0')}`; }
function generateTicketNo(): string { return `TKT-2024-${String(ticketIdCounter).padStart(3, '0')}`; }
function generateMsgId(): string { return `sm${String(msgIdCounter++).padStart(3, '0')}`; }

// ── GET /api/support/tickets ───────────────────────────────────────────────
router.get('/tickets', (req: Request, res: Response) => {
  try {
    const { status, type, priority, search } = req.query;
    let filtered = [...tickets];
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status as string)) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (type && ['inquiry', 'return', 'exchange', 'repair'].includes(type as string)) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (priority && ['low', 'normal', 'high', 'urgent'].includes(priority as string)) {
      filtered = filtered.filter(t => t.priority === priority);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.ticketNo.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    ok(res, filtered);
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/support/tickets/:id ───────────────────────────────────────────
router.get('/tickets/:id', (req: Request, res: Response) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id || t.ticketNo === req.params.id);
    if (!ticket) { notFound(res, '工单'); return; }
    const ticketMessages = messages.filter(m => m.ticketId === ticket.id);
    ok(res, { ...ticket, messages: ticketMessages });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/support/tickets ─────────────────────────────────────────────
router.post('/tickets', (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<SupportTicket>;
    if (!body.subject || !body.description || !body.customerEmail) {
      res.status(400).json({ success: false, error: 'subject、description、customerEmail 为必填项' });
      return;
    }
    const newTicket: SupportTicket = {
      id: generateTicketId(),
      ticketNo: generateTicketNo(),
      type: body.type || 'inquiry',
      status: 'open',
      subject: body.subject,
      description: body.description,
      orderId: body.orderId,
      priority: body.priority || 'normal',
      customerName: body.customerName || '匿名用户',
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      createdAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    ok(res, newTicket, '工单已创建');
  } catch (err) {
    serverError(res, err);
  }
});

// ── PUT /api/support/tickets/:id ──────────────────────────────────────────
router.put('/tickets/:id', (req: Request, res: Response) => {
  try {
    const idx = tickets.findIndex(t => t.id === req.params.id);
    if (idx === -1) { notFound(res, '工单'); return; }
    const updated: SupportTicket = {
      ...tickets[idx],
      ...req.body,
      id: tickets[idx].id,
      ticketNo: tickets[idx].ticketNo,
      createdAt: tickets[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    tickets[idx] = updated;
    ok(res, updated, '工单已更新');
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/support/tickets/:id/messages ─────────────────────────────────
router.get('/tickets/:id/messages', (req: Request, res: Response) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) { notFound(res, '工单'); return; }
    const ticketMessages = messages.filter(m => m.ticketId === ticket.id);
    ok(res, ticketMessages);
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/support/tickets/:id/messages ────────────────────────────────
router.post('/tickets/:id/messages', (req: Request, res: Response) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) { notFound(res, '工单'); return; }
    const body = req.body as Partial<SupportMessage>;
    if (!body.message || !body.author || !body.authorName) {
      res.status(400).json({ success: false, error: 'message、author、authorName 为必填项' });
      return;
    }
    if (!['customer', 'agent'].includes(body.author)) {
      res.status(400).json({ success: false, error: 'author 必须是 customer 或 agent' });
      return;
    }
    const newMsg: SupportMessage = {
      id: generateMsgId(),
      ticketId: ticket.id,
      author: body.author as MessageAuthor,
      authorName: body.authorName,
      message: body.message,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMsg);

    // Update ticket status if agent replies
    if (body.author === 'agent') {
      ticket.status = 'in_progress';
      ticket.adminReply = body.message;
      ticket.updatedAt = new Date().toISOString();
    }

    ok(res, newMsg, '消息已发送');
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /api/support/faqs ────────────────────────────────────────────────
router.get('/faqs', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let filtered = [...faqs];
    if (category) filtered = filtered.filter(f => f.category === category);
    filtered.sort((a, b) => a.orderIndex - b.orderIndex);
    ok(res, filtered);
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /api/support/faqs ────────────────────────────────────────────────
router.post('/faqs', (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<SupportFAQ>;
    if (!body.question || !body.answer) {
      res.status(400).json({ success: false, error: 'question 和 answer 为必填项' });
      return;
    }
    const newFaq: SupportFAQ = {
      id: `faq${String(faqIdCounter++).padStart(3, '0')}`,
      question: body.question,
      answer: body.answer,
      category: body.category || '一般',
      orderIndex: body.orderIndex || faqs.length + 1,
    };
    faqs.push(newFaq);
    ok(res, newFaq, 'FAQ 已添加');
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
