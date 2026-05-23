/**
 * 小红书商品数据抓取脚本
 * 抓取小红书笔记中的品牌商品信息，转换为 CLOTH 格式
 *
 * 使用方法: npm run scrape:xiaohongshu
 * 注意: 小红书有严格的反爬机制，建议配合代理池使用
 *
 * 替代方案:
 * 1. 使用小红书官方 API (需要申请)
 * 2. 使用 Playwright 浏览器自动化
 * 3. 使用 xiaohongshu-mcp 工具 (推荐)
 */
import axios from 'axios';

// ==================== 类型 ====================
interface XHSNote {
  noteId: string;
  title: string;
  desc: string;
  images: string[];
  user: { nickname: string };
  tags: string[];
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
const XHS_API_BASE = 'https://www.xiaohongshu.com';

// 搜索关键词（奢侈品相关）
const SEARCH_QUERIES = [
  'Gucci 二手',
  'Chanel 二手',
  'Prada 二手',
  'LV 二手',
  'Dior 二手',
];

// 品牌识别正则
const BRAND_PATTERNS: [RegExp, string][] = [
  [/gucci|古驰/gi, 'Gucci'],
  [/chanel|香奈儿/gi, 'Chanel'],
  [/prada|普拉达/gi, 'Prada'],
  [/louis vuitton|lv|路易威登/gi, 'Louis Vuitton'],
  [/dior|迪奥/gi, 'Dior'],
  [/herm[èe]s|爱马仕/gi, 'Hermès'],
  [/burberry|博柏利/gi, 'Burberry'],
  [/balenciaga|巴黎世家/gi, 'Balenciaga'],
  [/fendi|芬迪/gi, 'Fendi'],
  [/celine|赛琳/gi, 'Celine'],
];

// 分类关键词
const CATEGORY_KEYWORDS: [string[], string][] = [
  [['包', '袋', 'bag', 'purse', 'wallet', 'clutch'], '包袋'],
  [['衣服', '服饰', 'dress', 'coat', 'jacket', 'sweater'], '服饰'],
  [['鞋', 'heel', 'shoe', 'boot', 'sneaker'], '鞋履'],
  [['表', 'watch', '围巾', 'scarf', '腰带', 'belt', '首饰', '珠宝'], '配饰'],
];

// ==================== 工具函数 ====================

/**
 * 从文本中提取品牌
 */
function extractBrand(text: string): string {
  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(text)) return brand;
  }
  return '';
}

/**
 * 从文本中提取价格
 */
function extractPrice(text: string): number {
  // 匹配人民币价格: ¥1999, 1999元, 1999块
  const patterns = [
    /¥\s*(\d+)/,
    /(\d+)\s*元/,
    /(\d+)\s*块/,
    /rmb\s*(\d+)/gi,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const price = parseInt(match[1], 10);
      if (price > 100) return price; // 过滤掉太小的数字
    }
  }
  return 0;
}

/**
 * 判断商品分类
 */
function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keywords, category] of CATEGORY_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase()) || text.includes(kw)) {
        return category;
      }
    }
  }
  return '配饰';
}

/**
 * 判断成色
 */
function extractCondition(text: string): string {
  const t = text.toLowerCase();
  if (/全新|未使用|全新未拆封/.test(t)) return '全新';
  if (/几乎全新|只试背|只试穿/.test(t)) return '几乎全新';
  if (/轻微|用过几次|很少背/.test(t)) return '轻微使用痕迹';
  return '轻微使用痕迹';
}

/**
 * 判断尺寸
 */
function extractSize(text: string): string {
  // 常见尺寸格式
  const patterns = [
    /size[:\s]*([\w\d]+)/i,
    /尺码[:\s]*([\S]+)/,
    /(mini|small|medium|large|big)/gi,
    /(\d{2})\s*[码号]?/,
    /(\d+)\s*cm/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  return '';
}

/**
 * 判断是否包含商品信息（而非单纯的晒单）
 */
function isProductNote(note: XHSNote): boolean {
  const text = note.title + ' ' + note.desc;
  const priceIndicators = [/¥\d+/, /\d+\s*元/, /\d+\s*块/];
  const hasPrice = priceIndicators.some(p => p.test(text));
  const hasBrand = BRAND_PATTERNS.some(([pattern]) => pattern.test(text));
  return hasPrice && hasBrand;
}

/**
 * 转换为 CLOTH 格式
 */
function toClothFormat(note: XHSNote): ClothProduct {
  const text = note.title + ' ' + note.desc;
  const brand = extractBrand(text) || '其他';
  const price = extractPrice(text);
  const originalPrice = price > 0 ? Math.round(price / 0.7) : 0;

  return {
    title: note.title || '小红书好物',
    brand,
    category: guessCategory(text),
    price,
    originalPrice,
    condition: extractCondition(text),
    size: extractSize(text),
    description: note.desc.slice(0, 500), // 限制描述长度
    images: note.images.slice(0, 5),
    platform: '小红书',
    status: '待售',
  };
}

// ==================== API 请求 ====================

/**
 * 搜索小红书笔记
 * 注意: 这是一个模拟函数，实际需要使用 Playwright 或 MCP 工具
 */
async function searchXHSNotes(query: string): Promise<XHSNote[]> {
  console.log(`📡 搜索小红书: "${query}"`);

  // 小红书有严格的反爬，以下为概念性实现
  // 实际推荐使用以下方式之一:
  // 1. xiaohongshu-mcp 工具 (推荐)
  // 2. Playwright 浏览器自动化
  // 3. 官方开放平台 API (需申请)
  try {
    // 模拟 API 调用（实际会失败，需替换为真实 API）
    const { data } = await axios.get(`${XHS_API_BASE}/api/sns/v1/search/notes`, {
      params: {
        keyword: query,
        page: 1,
        page_size: 20,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': XHS_API_BASE,
      },
      timeout: 10000,
    });

    if (data?.data?.notes) {
      return data.data.notes.map((n: Record<string, unknown>) => ({
        noteId: n.note_id as string,
        title: n.title as string,
        desc: n.desc as string,
        images: (n.image_list as Array<{url_default: string}>)?.map((i) => i.url_default) || [],
        user: { nickname: (n.user as Record<string, string>)?.nickname || '' },
        tags: (n.tag_list as Array<{name: string}>)?.map(t => t.name) || [],
      }));
    }
    return [];
  } catch (_err) {
    // 小红书反爬，预期失败
    console.warn(`  ⚠️  小红书 API 访问受限 (需使用 Playwright 或 MCP 工具)`);
    return [];
  }
}

// ==================== 主流程 ====================
async function main() {
  console.log('📕 CLOTH 小红书抓取工具启动');
  console.log('='.repeat(50));
  console.log('⚠️  注意: 小红书有严格反爬，建议使用 xiaohongshu-mcp 工具\n');

  const allProducts: ClothProduct[] = [];

  for (const query of SEARCH_QUERIES) {
    const notes = await searchXHSNotes(query);

    for (const note of notes) {
      if (isProductNote(note)) {
        const product = toClothFormat(note);
        if (product.price > 0) {
          allProducts.push(product);
          console.log(`  ✅ 提取商品: ${product.title} - ¥${product.price} [${product.brand}]`);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 共提取 ${allProducts.length} 件商品`);

  if (allProducts.length > 0) {
    console.log(JSON.stringify(allProducts, null, 2));
  } else {
    console.log('\n💡 推荐使用方式:');
    console.log('1. 使用 xiaohongshu-mcp 工具');
    console.log('2. 使用 Playwright 浏览器自动化');
    console.log('3. 手动导出小红书笔记数据后导入');
  }
}

main().catch(console.error);
