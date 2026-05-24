/**
 * CLOTH API 服务入口
 * 启动 Express 服务器，配置中间件和路由
 */
import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import brandsRouter from './routes/brands';
import categoriesRouter from './routes/categories';
import financeRouter from './routes/finance';
import inventoryRouter from './routes/inventory';
import supportRouter from './routes/support';
import liveRouter from './routes/live';

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== 中间件 ====================
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
  console.log(`🛍️  CLOTH API 服务已启动`);
  console.log(`📡 监听端口: http://localhost:${PORT}`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📦 商品数量: 12 (种子数据)`);
  console.log(`📋 订单数量: 2 (种子数据)`);
});
