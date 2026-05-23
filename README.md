# CLOTH — 二手奢侈品时尚交易平台

> 中国领先的二手奢侈品时尚交易平台，精选全球顶级品牌（Gucci、Chanel、Prada、Louis Vuitton 等），让奢品循环新生。

## 项目概述

CLOTH 是一个完整的全栈电商应用，参考 Depop / Vestiaire Collective 的设计风格，专为中文市场打造。

```
~/Documents/cloth/
├── api/          # Express.js REST API (端口 3001)
├── web/          # React + Vite 前端 (端口 5173)
├── scripts/      # 自动化脚本（抓取、上架）
└── README.md
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + TypeScript | 函数组件 + Hooks |
| 样式 | CSS Modules | 组件化、局部作用域 |
| 构建 | Vite 5 | 快速 HMR |
| 后端 | Express.js + TypeScript | RESTful API |
| 数据 | 内存存储 | 启动即用，无需数据库 |
| 脚本 | Node.js + tsx | TypeScript 原生运行 |

## 快速开始

### 1. 安装依赖

```bash
cd ~/Documents/cloth
npm install
```

### 2. 启动 API 服务

```bash
# 方式一：后台运行
npm run dev --workspace=api

# 方式二：查看实时日志
cd api && npm run dev
```

API 启动后访问: http://localhost:3001/api/health

### 3. 启动前端

```bash
# 新开终端
npm run dev --workspace=web

# 或
cd web && npm run dev
```

前端启动后访问: http://localhost:5173

### 4. 一键启动全部

```bash
npm run dev
```

## 目录结构

### API (`api/`)

```
api/src/
├── index.ts          # Express 入口，路由挂载
├── routes/
│   ├── products.ts   # 商品 CRUD API
│   ├── orders.ts     # 订单 API
│   ├── brands.ts     # 品牌列表 API
│   └── categories.ts  # 分类列表 API
├── models/
│   ├── types.ts      # TypeScript 类型定义
│   └── store.ts      # 内存数据存储 + 种子数据
└── middleware/
    └── response.ts   # 统一响应格式
```

### 前端 (`web/`)

```
web/src/
├── App.tsx           # 路由配置
├── api/
│   └── client.ts     # API 客户端封装
├── components/
│   ├── Header.tsx    # 顶部导航栏
│   ├── Footer.tsx    # 底部栏
│   └── ProductCard.tsx # 商品卡片
├── hooks/
│   ├── useCart.tsx  # 购物车状态管理
│   └── useToast.tsx  # Toast 通知
├── pages/
│   ├── Home.tsx       # 首页（精选+品牌+分类）
│   ├── ProductList.tsx # 商品列表（筛选+分页）
│   ├── ProductDetail.tsx # 商品详情
│   ├── Cart.tsx       # 购物车
│   ├── Orders.tsx     # 订单管理
│   └── Admin.tsx      # 管理后台
└── types/
    └── index.ts       # 共享类型
```

### 脚本 (`scripts/`)

```
scripts/
├── scrapers/
│   ├── depopScraper.ts       # Depop 抓取
│   ├── vestiaireScraper.ts   # Vestiaire Collective 抓取
│   └── xiaohongshuScraper.ts # 小红书抓取
└── uploader/
    └── autoUpload.ts         # 自动上架到 CLOTH
```

## API 文档

### 商品

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 商品列表（支持筛选分页） |
| GET | `/api/products/:id` | 商品详情 |
| POST | `/api/products` | 上架商品 |
| PUT | `/api/products/:id` | 更新商品 |
| DELETE | `/api/products/:id` | 下架商品 |

### 订单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 订单列表 |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/orders` | 创建订单 |
| PUT | `/api/orders/:id` | 更新订单状态 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/brands` | 品牌列表 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/health` | 健康检查 |

### 筛选参数

```
GET /api/products?brand=Chanel&category=包袋&condition=全新&minPrice=1000&maxPrice=50000&search=gucci&page=1&limit=12
```

## 数据模型

### Product (商品)

```typescript
interface Product {
  id: string;
  title: string;         // 商品标题
  brand: string;         // 品牌
  category: string;      // 分类：包袋、服饰、鞋履、配饰、珠宝
  price: number;         // 售价
  originalPrice: number; // 原价
  condition: '全新' | '几乎全新' | '轻微使用痕迹' | '有明显使用痕迹';
  size: string;          // 尺寸
  description: string;   // 商品描述
  images: string[];      // 图片 URL 列表
  platform?: string;     // 来源平台
  status: '待售' | '已售' | '已下架';
  createdAt: string;
}
```

### Order (订单)

```typescript
interface Order {
  id: string;
  productId: string;
  buyerInfo: { name: string; phone: string; address: string };
  status: '待付款' | '待发货' | '已发货' | '已完成' | '已取消';
  totalPrice: number;
  createdAt: string;
}
```

## 自动化脚本

### 抓取 Depop 商品

```bash
npm run scrape:depop --workspace=scripts
```

### 抓取 Vestiaire Collective

```bash
npm run scrape:vestiaire --workspace=scripts
```

### 自动上架到 CLOTH

```bash
# 1. 准备数据到 scripts/src/uploads/pending.json
# 2. 上传
npm run upload --workspace=scripts -- --confirm
```

## 品牌列表

| 英文 | 中文 |
|------|------|
| Gucci | 古驰 |
| Prada | 普拉达 |
| Chanel | 香奈儿 |
| Louis Vuitton | 路易威登 |
| Dior | 迪奥 |
| Hermès | 爱马仕 |
| Burberry | 博柏利 |
| Balenciaga | 巴黎世家 |
| Fendi | 芬迪 |
| Celine | 赛琳 |

## 设计风格

- **字体**: Playfair Display (标题) + Noto Sans SC (正文)
- **色调**: 温暖米白色底 + 深色文字 + 金色强调
- **质感**: 大量留白、微圆角、精致阴影

## 环境变量

```bash
# API 环境变量 (.env)
CLOTH_API_URL=http://localhost:3001

# 脚本环境变量
CLOTH_API_URL=http://localhost:3001
```

## 后续扩展建议

- [ ] 接入 SQLite/PostgreSQL 持久化存储
- [ ] 添加用户认证 (JWT)
- [ ] 实现真实图片上传 (S3/Cloudinary)
- [ ] 添加订单通知 (微信/邮件)
- [ ] 接入支付接口
- [ ] 添加 Redis 缓存
- [ ] E2E 测试 (Playwright)

---

Built with ❤️ for the Chinese luxury resale community.
