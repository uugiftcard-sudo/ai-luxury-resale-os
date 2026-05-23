/**
 * Vestiaire Collective 商品数据抓取脚本
 * 抓取 Vestiaire Collective 平台商品数据，转换为 CLOTH 格式
 *
 * 使用方法: npm run scrape:vestiaire
 */
import axios from 'axios';
import * as cheerio from 'cheerio';

// ==================== 类型 ====================
interface VestiaireProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  condition: string;
  size: string;
  images: string[];
  description: string;
  url: string;
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
const VESTIAIRE_BASE_URL = 'https://www.vestiairecollective.com';
// 搜索关键词
const SEARCH_QUERIES = ['gucci', 'chanel', 'prada', 'louis vuitton', 'hermes'];

// Vestiaire 成色映射
const CONDITION_MAP: Record<string, string> = {
  'never_used': '全新',
  'very_good': '几乎全新',
  'good': '轻微使用痕迹',
  'fair': '有明显使用痕迹',
};

// ==================== 工具函数 ====================

/**
 * 抓取 Vestiaire 商品详情
 */
async function scrapeProductDetail(url: string): Promise<VestiaireProduct | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    const title = $('[data-testid="product-title"]').text().trim()
      || $('h1').first().text().trim()
      || '';

    // Vestiaire 价格通常在特定选择器中
    const priceText = $('[data-testid="product-price"]').text().trim()
      || $('[itemprop="price"]').attr('content')
      || '0';

    const description = $('[data-testid="product-description"]').text().trim()
      || $('meta[name="description"]').attr('content')
      || '';

    const image = $('meta[property="og:image"]').attr('content') || '';

    const brand = extractBrand(title + ' ' + description);

    return {
      id: url.split('-').pop()?.replace(/\//g, '') || '',
      title,
      brand,
      price: parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0,
      originalPrice: 0,
      condition: '几乎全新',
      size: '',
      images: image ? [image] : [],
      description,
      url,
    };
  } catch (err) {
    console.error(`❌ 抓取失败: ${url}`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * 搜索 Vestiaire 商品
 */
async function searchVestiaire(query: string): Promise<string[]> {
  try {
    const searchUrl = `${VESTIAIRE_BASE_URL}/search/${encodeURIComponent(query)}-sold-1.html`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const urls: string[] = [];

    // Vestiaire 商品链接格式
    $('a[href*="/product/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        urls.push(href.startsWith('http') ? href : `${VESTIAIRE_BASE_URL}${href}`);
      }
    });

    console.log(`  找到 ${urls.length} 个商品链接`);
    return [...new Set(urls)].slice(0, 10);
  } catch (err) {
    console.error(`❌ 搜索失败: ${query}`, err instanceof Error ? err.message : err);
    return [];
  }
}

function extractBrand(text: string): string {
  const brands = ['Gucci', 'Prada', 'Chanel', 'Louis Vuitton', 'Dior', 'Hermès',
    'Burberry', 'Balenciaga', 'Fendi', 'Celine'];
  const upper = text.toUpperCase();
  for (const b of brands) {
    if (upper.includes(b.toUpperCase())) return b;
  }
  return '';
}

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (/bag|purse|backpack|wallet|clutch/.test(t)) return '包袋';
  if (/dress|coat|jacket|sweater/.test(t)) return '服饰';
  if (/shoe|boot|heel|sneaker/.test(t)) return '鞋履';
  return '配饰';
}

// ==================== 主流程 ====================
async function main() {
  console.log('🛍️  CLOTH Vestiaire Collective 抓取工具启动');
  console.log('='.repeat(50));

  const allProducts: ClothProduct[] = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`\n📡 搜索: "${query}"`);
    const urls = await searchVestiaire(query);

    for (const url of urls) {
      const product = await scrapeProductDetail(url);
      if (product) {
        const clothProduct: ClothProduct = {
          title: product.title,
          brand: product.brand,
          category: guessCategory(product.title),
          price: product.price,
          originalPrice: product.originalPrice || Math.round(product.price / 0.7),
          condition: product.condition,
          size: product.size,
          description: product.description,
          images: product.images,
          platform: 'Vestiaire',
          status: '待售',
        };
        allProducts.push(clothProduct);
        console.log(`  ✅ 抓取成功: ${clothProduct.title}`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 共抓取 ${allProducts.length} 件商品`);
  console.log(JSON.stringify(allProducts, null, 2));
  console.log('\n💡 运行 npm run upload 将数据上架到 CLOTH');
}

main().catch(console.error);
