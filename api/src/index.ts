/**
 * CLOTH API 服务入口
 * 启动 Express + Socket.IO 服务器，配置中间件和路由
 */
import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import brandsRouter from './routes/brands';
import categoriesRouter from './routes/categories';
import financeRouter from './routes/finance';
import inventoryRouter from './routes/inventory';
import supportRouter from './routes/support';
import liveRouter from './routes/live';
import authRouter from './routes/auth';
import paymentsRouter from './routes/payments';
import aiRouter from './routes/ai';
import inventorySyncRouter from './routes/inventorySync';
import chatRouter, { setSocketIO } from './routes/chat';
import { errorHandler } from './middleware/response';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// ==================== Socket.IO ====================
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s: string) => s.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

// Inject io into chat router
setSocketIO(io);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    // Allow unauthenticated connections for now (chat requires auth via REST API)
    socket.data.userId = null;
    return next();
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    socket.data.userId = decoded.sub;
    next();
  } catch {
    socket.data.userId = null;
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  if (userId) {
    // Join personal room for direct messages
    socket.join(`user:${userId}`);
    console.log(`[Socket.IO] User connected: ${userId}`);
  }

  // Join a conversation room
  socket.on('chat:join', (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on('chat:leave', (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Socket disconnected: ${socket.id} (user: ${userId || 'anonymous'})`);
  });
});

// ==================== 中间件 ====================
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s: string) => s.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== 请求日志 ====================
app.use((req, _res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.path}`);
  next();
});

// ==================== 路由 ====================
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/finance', financeRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/support', supportRouter);
app.use('/api/live', liveRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/inventory', inventorySyncRouter);
app.use('/api/chat', chatRouter);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CLOTH API 服务运行中',
    timestamp: new Date().toISOString(),
  });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API 路由不存在',
  });
});

app.use(errorHandler);

// ==================== 启动服务器 ====================
httpServer.listen(PORT, () => {
  console.log(`🛍️  CLOTH API 服务已启动`);
  console.log(`📡 监听端口: http://localhost:${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📦 商品数量: 12 (种子数据)`);
  console.log(`📋 订单数量: 2 (种子数据)`);
  console.log(`💬 Socket.IO 已启用`);
});
