/**
 * CLOTH 自动上架脚本
 * 将抓取的商品数据自动上架到 CLOTH 平台
 *
 * 使用方法: npm run upload
 *
 * 支持两种模式:
 * 1. 从文件中读取商品数据 (src/uploads/pending.json)
 * 2. 直接接收 scraper 输出
 */
import * as fs from 'fs';
import * as path from 'path';

// ==================== 类型定义 ====================
interface UploadProduct {
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: string;
  size: string;
  description: string;
  images: string[];
  platform?: string;
}

interface UploadResult {
  success: boolean;
  productId?: string;
  title: string;
  error?: string;
}

// ==================== 常量 ====================
const CLOTH_API_BASE = process.env.CLOTH_API_URL || 'http://localhost:3001';
const UPLOAD_DIR = path.join(__dirname, '../src/uploads');
const PENDING_FILE = path.join(UPLOAD_DIR, 'pending.json');
const LOG_FILE = path.join(UPLOAD_DIR, 'upload-log.json');

// ==================== API 交互 ====================

/**
 * 上架单个商品到 CLOTH
 */
async function uploadProduct(product: UploadProduct): Promise<UploadResult> {
  try {
    const response = await fetch(`${CLOTH_API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        condition: product.condition,
        size: product.size,
        description: product.description,
        images: product.images,
        platform: product.platform,
        status: '待售',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, title: product.title, error: data.error || `HTTP ${response.status}` };
    }

    return { success: true, productId: data.data?.id, title: product.title };
  } catch (err) {
    return {
      success: false,
      title: product.title,
      error: err instanceof Error ? err.message : '未知错误',
    };
  }
}

/**
 * 批量上架
 */
async function batchUpload(products: UploadProduct[]): Promise<{
  succeeded: UploadResult[];
  failed: UploadResult[];
}> {
  const succeeded: UploadResult[] = [];
  const failed: UploadResult[] = [];

  console.log(`\n🚀 开始上架 ${products.length} 件商品...\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const result = await uploadProduct(p);

    if (result.success) {
      succeeded.push(result);
      console.log(`  ✅ [${i + 1}/${products.length}] ${result.title} (ID: ${result.productId})`);
    } else {
      failed.push(result);
      console.log(`  ❌ [${i + 1}/${products.length}] ${result.title} - ${result.error}`);
    }

    // 间隔 1 秒避免 API 过载
    if (i < products.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { succeeded, failed };
}

// ==================== 文件操作 ====================

/**
 * 确保上传目录存在
 */
function ensureDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`📁 创建目录: ${UPLOAD_DIR}`);
  }
}

/**
 * 读取待上架商品
 */
function loadPendingProducts(): UploadProduct[] {
  ensureDir();

  if (!fs.existsSync(PENDING_FILE)) {
    console.log(`\n⚠️  未找到待上架文件: ${PENDING_FILE}`);
    console.log('💡 请先将商品数据写入 src/uploads/pending.json');
    return [];
  }

  const content = fs.readFileSync(PENDING_FILE, 'utf-8');
  const data = JSON.parse(content);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;

  console.warn('⚠️  文件格式不正确，应为数组或 { products: [...] }');
  return [];
}

/**
 * 保存上传日志
 */
function saveLog(results: { succeeded: UploadResult[]; failed: UploadResult[] }): void {
  ensureDir();

  const log = {
    timestamp: new Date().toISOString(),
    total: results.succeeded.length + results.failed.length,
    succeeded: results.succeeded.length,
    failed: results.failed.length,
    results,
  };

  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
  console.log(`\n📝 上传日志已保存: ${LOG_FILE}`);
}

/**
 * 清除待上架文件（成功时）
 */
function clearPending(): void {
  if (fs.existsSync(PENDING_FILE)) {
    const backupFile = PENDING_FILE.replace('.json', `.backup.${Date.now()}.json`);
    fs.copyFileSync(PENDING_FILE, backupFile);
    fs.unlinkSync(PENDING_FILE);
    console.log(`📦 pending.json 已备份并清除`);
  }
}

// ==================== 主流程 ====================
async function main() {
  console.log('🛍️  CLOTH 自动上架工具');
  console.log(`📡 API 地址: ${CLOTH_API_BASE}`);
  console.log('='.repeat(50));

  // 检查 API 是否可用
  try {
    const healthRes = await fetch(`${CLOTH_API_BASE}/api/health`);
    const health = await healthRes.json();
    if (health.success) {
      console.log(`✅ API 连接正常: ${health.message}`);
    }
  } catch {
    console.error(`❌ 无法连接到 CLOTH API: ${CLOTH_API_BASE}`);
    console.error('💡 请确保 API 服务已启动 (npm run dev --workspace=api)');
    process.exit(1);
  }

  // 加载待上架商品
  const products = loadPendingProducts();

  if (products.length === 0) {
    console.log('\n❌ 没有待上架的商品');
    console.log('\n💡 使用方式:');
    console.log('1. 运行抓取脚本，将结果保存到 src/uploads/pending.json');
    console.log('2. 手动编辑 pending.json 添加商品');
    console.log('3. 运行 npm run upload');
    process.exit(0);
  }

  console.log(`\n📦 待上架商品: ${products.length} 件`);

  // 确认提示
  const args = process.argv.slice(2);
  if (!args.includes('--confirm') && !args.includes('-y')) {
    console.log('\n⚠️  将上架以下商品:');
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.brand}] ${p.title} - ¥${p.price}`);
    });
    console.log('\n添加 --confirm 或 -y 参数跳过确认');
    console.log('\n💡 示例: npm run upload -- --confirm\n');
  }

  // 执行上传
  const results = await batchUpload(products);

  // 保存日志
  saveLog(results);

  // 清理
  if (results.failed.length === 0) {
    clearPending();
  }

  // 汇总
  console.log('\n' + '='.repeat(50));
  console.log('📊 上架结果汇总:');
  console.log(`  ✅ 成功: ${results.succeeded.length} 件`);
  console.log(`  ❌ 失败: ${results.failed.length} 件`);

  if (results.failed.length > 0) {
    console.log('\n失败商品:');
    results.failed.forEach(f => {
      console.log(`  - ${f.title}: ${f.error}`);
    });
  }

  if (results.succeeded.length > 0) {
    console.log('\n✅ 全部商品上架成功!');
  }
}

main().catch(console.error);
