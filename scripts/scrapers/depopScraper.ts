/**
 * Depop 商品数据抓取脚本
 * 抓取 Depop 平台商品数据，转换为 CLOTH 格式
 *
 * 使用方法: npm run scrape:depop
 * 依赖: axios, cheerio
 */
import axios from 'axios';
import * as cheerio from 'cheerio';

// ==================== 类型定义 ====================
interface DepopProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  condition: string;
  size: string;
  images: string[];
  description: string;
  url: string;
  seller: string;
}

interface ClothProduct {
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  condition: string;
  size: string;
  description: string;
  images: string[];
  platform: string;
  status: string;
}

// ==================== 常量 ====================
const DEPOP_BASE_URL = 'https://www.depop.com';
// 搜索关键词（可配置）
const SEARCH_QUERIES = ['gucci bag', 'chanel bag', 'prada bag', 'louis vuitton'];

// ==================== 工具函数 ====================

/**
 * 从 Depop 商品页抓取详情
 */
async function scrapeProductDetail(url: string): Promise<DepopProduct | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // 从页面提取数据（Depop 使用 React SSR，具体选择器可能随版本变化）
    const title = $('h1[data-testid="product-title"]').text().trim()
      || $('h1').first().text().trim()
      || '';

    const priceText = $('[data-testid="product-price"]').text().trim()
      || $('[itemprop="price"]').attr('content')
      || '0';

    const description = $('[data-testid="product-description"]').text().trim()
      || $('meta[name="description"]').attr('content')
      || '';

    // 从 meta og:image 获取图片
    const image = $('meta[property="og:image"]').attr('content') || '';

    // 提取品牌（通常在标题或描述中）
    const brand = extractBrand(title + ' ' + description);

    return {
      id: url.split('/').pop() || '',
      title,
      brand,
      price: parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0,
      currency: 'USD',
      condition: '几乎全新',
      size: '',
      images: image ? [image] : [],
      description,
      url,
      seller: '',
    };
  } catch (err) {
    console.error(`❌ 抓取失败: ${url}`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * 搜索 Depop 商品列表
 */
async function searchDepop(query: string): Promise<string[]> {
  try {
    const searchUrl = `${DEPOP_BASE_URL}/search/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const urls: string[] = [];

    // 提取商品链接（Depop 商品链接格式）
    $('a[href*="/products/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('/products/')) {
        urls.push(`${DEPOP_BASE_URL}${href}`);
      }
    });

    console.log(`  找到 ${urls.length} 个商品链接`);
    return [...new Set(urls)].slice(0, 10); // 限制数量
  } catch (err) {
    console.error(`❌ 搜索失败: ${query}`, err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * 从文本中提取品牌
 */
function extractBrand(text: string): string {
  const brands = ['Gucci', 'Prada', 'Chanel', 'Louis Vuitton', 'Dior', 'Hermès',
    'Burberry', 'Balenciaga', 'Fendi', 'Celine', 'Bottega Veneta', 'YSL'];
  const upper = text.toUpperCase();
  for (const b of brands) {
    if (upper.includes(b.toUpperCase())) return b;
  }
  return '';
}

/**
 * 判断分类
 */
function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/bag|purse|backpack|wallet|bag|clutch/.test(t)) return '包袋';
  if (/dress|coat|jacket|sweater|shirt|top/.test(t)) return '服饰';
  if (/shoe|boot|heel|sneaker|loafer/.test(t)) return '鞋履';
  if (/watch|scarf|belt|sunglass|jewelry|ring/.test(t)) return '配饰';
  return '配饰';
}

// ==================== 汇率转换 (USD -> CNY) ====================
const USD_TO_CNY = 7.2;

/**
 * 转换为 CLOTH 格式
 */
function toClothFormat(product: DepopProduct): ClothProduct {
  const priceInCNY = Math.round(product.price * USD_TO_CNY);
  // 二手价约为原价的 60-80%
  const originalPrice = Math.round(priceInCNY / 0.65);

  return {
    title: product.title || '未知商品',
    brand: product.brand || '其他',
    category: guessCategory(product.title),
    price: priceInCNY,
    originalPrice,
    condition: product.condition,
    size: product.size,
    description: product.description,
    images: product.images,
    platform: 'Depop',
    status: '待售',
  };
}

// ==================== 主流程 ====================
async function main() {
  console.log('🛍️  CLOTH Depop 抓取工具启动');
  console.log('=' .repeat(50));

  const allProducts: ClothProduct[] = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`\n📡 搜索: "${query}"`);
    const urls = await searchDepop(query);

    for (const url of urls) {
      const product = await scrapeProductDetail(url);
      if (product) {
        const clothProduct = toClothFormat(product);
        allProducts.push(clothProduct);
        console.log(`  ✅ 抓取成功: ${clothProduct.title} - ¥${clothProduct.price}`);
      }
    }
  }

  // 输出结果
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 共抓取 ${allProducts.length} 件商品`);
  console.log(JSON.stringify(allProducts, null, 2));

  // TODO: 传递给 autoUpload.ts 上架
  console.log('\n💡 运行 npm run upload 将数据上架到 CLOTH');
}

main().catch(console.error);

/**
 * Named export for CLI / run-cycle.ts
 */
export async function scrapeDepop(): Promise<number> {
  const queries = ['gucci bag sold', 'chanel bag sold', 'prada bag sold', 'louis vuitton bag sold'];
  let total = 0;
  for (const query of queries) {
    const urls = await searchDepop(query);
    for (const url of urls.slice(0, 5)) {
      try {
        const p = await scrapeProductDetail(url);
        if (p && p.price > 0) total++;
      } catch { /* skip failed individual products */ }
    }
  }
  return total;
}

export { searchDepop, scrapeProductDetail };
