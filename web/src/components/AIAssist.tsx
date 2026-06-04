/**
 * AI Assist Component
 * Button + modal that calls the AI description generation API
 * and lets the seller preview/edit the result before applying.
 * Can be embedded in product listing or admin pages.
 */
import { useState } from 'react';
import { aiApi } from '../api/ai';
import { useToast } from '../hooks/useToast';
import styles from './AIAssist.module.css';

interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
  highlights: string[];
}

interface AIAssistProps {
  /** Current product data (used as prompt context) */
  productData: {
    name?: string;
    brand?: string;
    category?: string;
    condition?: string;
    size?: string;
    originalPrice?: number;
  };
  market?: string;
  onApply: (content: GeneratedContent) => void;
  /** Pass true to disable the button (e.g. when user is not logged in) */
  disabled?: boolean;
}

const COPY: Record<string, Record<string, string>> = {
  UK: {
    button: 'AI Assist',
    title: 'AI Description Generator',
    nameLabel: 'Product Name',
    brandLabel: 'Brand',
    categoryLabel: 'Category',
    conditionLabel: 'Condition',
    sizeLabel: 'Size',
    generateBtn: 'Generate',
    previewTitle: 'AI Generated Result',
    descLabel: 'Description',
    tagsLabel: 'Tags',
    highlightsLabel: 'Highlights',
    applyBtn: 'Apply to Listing',
    cancelBtn: 'Cancel',
    notLoggedIn: 'Please log in to use AI Assist',
    noMarket: 'Please select a market first',
    generating: 'Generating description...',
  },
  HK: {
    button: 'AI 助手',
    title: 'AI 描述生成器',
    nameLabel: '商品名稱',
    brandLabel: '品牌',
    categoryLabel: '分類',
    conditionLabel: '成色',
    sizeLabel: '尺碼',
    generateBtn: '生成',
    previewTitle: 'AI 生成結果',
    descLabel: '描述',
    tagsLabel: '標籤',
    highlightsLabel: '亮點',
    applyBtn: '套用到 Listing',
    cancelBtn: '取消',
    notLoggedIn: '請先登入以使用 AI 助手',
    noMarket: '請先選擇市場',
    generating: '正在生成描述...',
  },
  CN: {
    button: 'AI 助手',
    title: 'AI 描述生成器',
    nameLabel: '商品名称',
    brandLabel: '品牌',
    categoryLabel: '分类',
    conditionLabel: '成色',
    sizeLabel: '尺码',
    generateBtn: '生成',
    previewTitle: 'AI 生成结果',
    descLabel: '描述',
    tagsLabel: '标签',
    highlightsLabel: '亮点',
    applyBtn: '应用到 Listing',
    cancelBtn: '取消',
    notLoggedIn: '请先登录以使用 AI 助手',
    noMarket: '请先选择市场',
    generating: '正在生成描述...',
  },
};

export default function AIAssist({ productData, market = 'CN', onApply, disabled = false }: AIAssistProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [editedDesc, setEditedDesc] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const { showToast } = useToast();
  const t = COPY[market] ?? COPY.CN;

  const token = localStorage.getItem('cloth_jwt');

  function canUse() {
    if (!token) return 'not-logged-in';
    if (!productData.name || !productData.brand || !productData.category || !productData.condition) {
      return 'incomplete';
    }
    return 'ok';
  }

  async function handleGenerate() {
    const status = canUse();
    if (status === 'not-logged-in') {
      showToast(t.notLoggedIn, 'error');
      return;
    }
    if (status === 'incomplete') {
      showToast('请先填写商品名称、品牌、分类和成色', 'error');
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const data = await aiApi.generateDescription({
        name: productData.name || '',
        brand: productData.brand || '',
        category: productData.category || '',
        condition: productData.condition || '',
        size: productData.size,
        originalPrice: productData.originalPrice,
        market,
      });
      setResult(data);
      setEditedDesc(data.description);
      setEditedTitle(data.title);
      setEditedTags(data.tags.join(', '));
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast('生成失败', 'error');
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleApply() {
    if (!result) return;
    onApply({
      title: editedTitle,
      description: editedDesc,
      tags: editedTags.split(',').map(s => s.trim()).filter(Boolean),
      highlights: result.highlights,
    });
    setOpen(false);
    showToast('AI description applied', 'success');
  }

  if (open) {
    return (
      <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>{t.title}</h3>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>×</button>
          </div>

          <div className={styles.modalBody}>
            {/* Prompt summary */}
            <div className={styles.promptSummary}>
              <div className={styles.promptRow}>
                <span className={styles.promptLabel}>{t.nameLabel}:</span>
                <span>{productData.name || '—'}</span>
              </div>
              <div className={styles.promptRow}>
                <span className={styles.promptLabel}>{t.brandLabel}:</span>
                <span>{productData.brand || '—'}</span>
              </div>
              <div className={styles.promptRow}>
                <span className={styles.promptLabel}>{t.categoryLabel}:</span>
                <span>{productData.category || '—'}</span>
              </div>
              <div className={styles.promptRow}>
                <span className={styles.promptLabel}>{t.conditionLabel}:</span>
                <span>{productData.condition || '—'}</span>
              </div>
              {productData.size && (
                <div className={styles.promptRow}>
                  <span className={styles.promptLabel}>{t.sizeLabel}:</span>
                  <span>{productData.size}</span>
                </div>
              )}
            </div>

            {!result && (
              <div className={styles.generateSection}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={generating || canUse() !== 'ok'}
                >
                  {generating ? t.generating : t.generateBtn}
                </button>
                {canUse() === 'incomplete' && (
                  <p className={styles.hint}>请先填写必填字段：名称、品牌、分类、成色</p>
                )}
              </div>
            )}

            {result && (
              <div className={styles.resultSection}>
                <h4>{t.previewTitle}</h4>

                <div className={styles.fieldGroup}>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className="form-label">{t.descLabel}</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={6}
                    value={editedDesc}
                    onChange={e => setEditedDesc(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className="form-label">{t.tagsLabel}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="tag1, tag2, tag3"
                    value={editedTags}
                    onChange={e => setEditedTags(e.target.value)}
                  />
                  <p className={styles.hint}>Comma-separated</p>
                </div>

                {result.highlights.length > 0 && (
                  <div className={styles.fieldGroup}>
                    <label className="form-label">{t.highlightsLabel}</label>
                    <ul className={styles.highlightsList}>
                      {result.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.actions}>
                  <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                    {t.cancelBtn}
                  </button>
                  <button className="btn btn-primary" onClick={handleApply}>
                    {t.applyBtn}
                  </button>
                  <button className="btn btn-outline" onClick={handleGenerate}>
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={styles.aiButton}
      onClick={() => {
        if (disabled || !token) {
          showToast(t.notLoggedIn, 'error');
          return;
        }
        setOpen(true);
      }}
      disabled={disabled}
      title={disabled ? t.notLoggedIn : 'AI Assist'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2"/>
        <path d="M12 8v4l3 3"/>
      </svg>
      {t.button}
    </button>
  );
}
