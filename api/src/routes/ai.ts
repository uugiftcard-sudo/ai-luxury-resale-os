/**
 * AI Routes
 * Handles AI-powered product description generation.
 * Integrates with OpenAI if OPENAI_API_KEY is configured.
 * Falls back to structured mock data when no AI provider is available.
 */
import { Router, Request, Response } from 'express';
import { ok, fail, serverError, validateRequired } from '../middleware/response';
import { requireAuth } from '../middleware/auth';

const router = Router();

interface GenerateDescriptionRequest {
  name: string;
  brand: string;
  category: string;
  condition: string;
  size?: string;
  originalPrice?: number;
  market?: string;
}

interface GeneratedDescription {
  title: string;
  description: string;
  tags: string[];
  highlights: string[];
  language: string;
}

const CONDITION_DESCRIPTIONS: Record<string, string> = {
  '全新': 'Brand new with tags, never used, complete packaging.',
  '几乎全新': 'Like new, used once or twice, excellent condition.',
  '轻微使用痕迹': 'Lightly used, minor signs of wear, well maintained.',
  '有明显使用痕迹': 'Visible wear, priced accordingly, still great value.',
};

const MARKET_LANGUAGES: Record<string, 'en' | 'zh-Hant' | 'zh-Hans'> = {
  UK: 'en',
  HK: 'zh-Hant',
  CN: 'zh-Hans',
};

/**
 * POST /api/ai/generate-description
 * Generates an AI-powered product description based on input data.
 * Requires authentication.
 */
router.post('/generate-description', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!validateRequired(req, res, ['name', 'brand', 'category', 'condition'])) return;

    const body = req.body as GenerateDescriptionRequest;
    const { name, brand, category, condition, size, originalPrice, market = 'CN' } = body;

    const language = MARKET_LANGUAGES[market] || 'zh-Hans';
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      await generateWithOpenAI(apiKey, { name, brand, category, condition, size, originalPrice, market }, language, res);
    } else {
      generateMockDescription({ name, brand, category, condition, size, originalPrice, market }, language, res);
    }
  } catch (err) {
    serverError(res, err);
  }
});

async function generateWithOpenAI(
  apiKey: string,
  data: GenerateDescriptionRequest,
  language: string,
  res: Response,
): Promise<void> {
  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const conditionNote = CONDITION_DESCRIPTIONS[data.condition] || '';
    const sizeNote = data.size ? ` Size: ${data.size}.` : '';

    const systemPrompt = language === 'en'
      ? `You are a luxury fashion copywriter. Write compelling product descriptions for second-hand designer items. Return valid JSON: { "title": "...", "description": "...", "tags": [...], "highlights": [...] }. Be authentic, detail-oriented, and highlight the item's condition accurately.`
      : language === 'zh-Hant'
      ? `你是奢侈品時尚文案專家。為二手名牌商品撰寫吸引人的產品描述。返回有效 JSON：{ "title": "...", "description": "...", "tags": [...], "highlights": [...] }。請如實描述，注重細節，準確反映商品成色。`
      : `你是奢侈品时尚文案专家。为二手名牌商品撰写吸引人的产品描述。返回有效 JSON：{ "title": "...", "description": "...", "tags": [...], "highlights": [...] }。请如实描述，注重细节，准确反映商品成色。`;

    const userPrompt = language === 'en'
      ? `Generate a product listing for: ${data.brand} ${data.name}. Category: ${data.category}. Condition: ${data.condition}.${conditionNote}${sizeNote}${data.originalPrice ? ` Original retail price: ~${data.originalPrice} CNY.` : ''}`
      : language === 'zh-Hant'
      ? `為以下商品生成 listing：${data.brand} ${data.name}。分類：${data.category}。成色：${data.condition}。${conditionNote}${sizeNote}${data.originalPrice ? ` 原始零售價：約 ${data.originalPrice} CNY。` : ''}`
      : `为以下商品生成 listing：${data.brand} ${data.name}。分类：${data.category}。成色：${data.condition}。${conditionNote}${sizeNote}${data.originalPrice ? ` 原始零售价：约 ${data.originalPrice} CNY。` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as Partial<GeneratedDescription>;

    const result: GeneratedDescription = {
      title: parsed.title || `${data.brand} ${data.name}`,
      description: parsed.description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      language,
    };

    ok(res, result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('Incorrect API key')) {
      fail(res, 401, 'OpenAI API key 无效');
      return;
    }
    serverError(res, err);
  }
}

function generateMockDescription(
  data: GenerateDescriptionRequest,
  language: string,
  res: Response,
): void {
  // TODO: Integrate with OpenAI or another AI provider.
  // Set OPENAI_API_KEY in environment variables to enable AI generation.
  // This mock returns structured data for development/testing purposes.
  const conditionNote = CONDITION_DESCRIPTIONS[data.condition] || '';
  const sizeNote = data.size ? ` 尺码：${data.size}。` : '';
  const priceNote = data.originalPrice
    ? language === 'en'
      ? ` Original retail: ~$${(data.originalPrice / 7).toFixed(0)} / ~HKD $${(data.originalPrice * 1.1).toFixed(0)}.`
      : ` 原始零售价：约 ${data.originalPrice} CNY。`
    : '';

  const result: GeneratedDescription = language === 'en'
    ? {
        title: `${data.brand} ${data.name}`,
        description: `${data.brand} ${data.name} — ${data.category.toLowerCase()}. ${conditionNote}${sizeNote}${priceNote} Professionally authenticated. Ships worldwide.`,
        tags: [
          data.brand.toLowerCase(),
          data.category.toLowerCase(),
          data.condition.toLowerCase().replace(/\s+/g, '-'),
          'luxury',
          'authenticated',
          'pre-owned',
          'designer',
        ],
        highlights: [
          `100% Authentic ${data.brand}`,
          `Condition: ${data.condition}`,
          sizeNote ? `Size: ${data.size}` : '',
          priceNote ? `Original price: ${data.originalPrice} CNY` : '',
          'Professionally authenticated before shipping',
        ].filter(Boolean),
        language,
      }
    : language === 'zh-Hant'
    ? {
        title: `${data.brand} ${data.name}`,
        description: `${data.brand} ${data.name}，${data.category}。${conditionNote}${sizeNote}${priceNote} 專業鑑定，附完整包裝說明。`,
        tags: [
          data.brand,
          data.category,
          '名牌',
          '二手',
          '鑑定',
          '奢品',
          data.condition,
        ],
        highlights: [
          `100% 正品 ${data.brand}`,
          `成色：${data.condition}`,
          sizeNote ? `尺码：${data.size}` : '',
          '專業鑑定後發貨',
        ].filter(Boolean),
        language,
      }
    : {
        title: `${data.brand} ${data.name}`,
        description: `${data.brand} ${data.name}，${data.category}。${conditionNote}${sizeNote}${priceNote} 专业鉴定，附完整包装说明。`,
        tags: [
          data.brand,
          data.category,
          '名牌',
          '二手',
          '鉴定',
          '奢品',
          data.condition,
        ],
        highlights: [
          `100% 正品 ${data.brand}`,
          `成色：${data.condition}`,
          sizeNote ? `尺码：${data.size}` : '',
          '专业鉴定后发货',
        ].filter(Boolean),
        language,
      };

  ok(res, result);
}

export default router;
