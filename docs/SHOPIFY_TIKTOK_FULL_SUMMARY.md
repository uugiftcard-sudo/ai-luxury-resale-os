# Shopify + TikTok AI Luxury Resale OS 完整總結

## 1. 一句講晒

呢個系統唔係普通二手名牌網店。

佢係一間「AI 一人公司」：

- Shopify 做中央店舖、產品庫、checkout、CRM、proof summary。
- TikTok 做主要流量、短片、直播、廣告、retargeting。
- AI Agent Team 幫你做 listing、影片、客服、風控、廣告、舊客跟進、出貨 checklist。

核心打法：

> Shopify 管資產，TikTok 管注意力，AI 管日常營運。

## 2. 生意定位

市場：

- 英國 UK
- 香港 HK

主賣：

- 二手真貨 luxury / designer / streetwear
- 價格：UK 約 £50-£800
- 價格：HK 約 HK$500-HK$8,000

另外保留：

- Budget fashion 線
- 服務舊客、平價時裝客、cheap fashion buyer
- 但唔可以賣 fake、replica、1:1、冒牌 logo

## 3. 兩條品牌線要分開

### Luxury Resale

只做真二手貨。

需要：

- proof pack
- condition notes
- 瑕疵相
- 來源紀錄
- serial/code 如有
- packing video
- tracking / payment proof

### Budget Fashion

可以賣：

- budget fashion
- Korean style
- quiet luxury look
- inspired style
- old money aesthetic

不可賣：

- fake
- replica
- 1:1
- mirror quality
- 冒牌 logo
- 假扮 designer brand

## 4. Shopify 係主店

Shopify 角色：

- 中央產品庫
- luxury / budget collection 分開
- UK/HK currency 分開
- proof summary 顯示
- customer tag / CRM
- checkout
- future ad retargeting base

已實作：

- Shopify mock connector
- product payload
- proof summary
- collection handles
- UK/HK store domain env
- weak proof luxury item 自動 draft/block

未做真 API：

- 之後放 Shopify token 入 `.env`
- 再接 Shopify Admin API

## 5. TikTok 係主流量機器

TikTok 角色：

- 短片流量
- live selling
- TikTok Shop UK
- TikTok ads
- retargeting
- old buyer reactivation

已實作：

- TikTok mock connector
- video hooks
- live talking points
- proof-first notes
- TikTok event plan
- ads plan
- manual review gate

重要規則：

- proof 弱嘅 luxury item 唔可以直接推 TikTok promotion
- 唔可以講 fake sold out
- 唔可以扮假客人 review
- 唔可以亂講 100% authentic
- TikTok Shop API 要按官方 seller/partner approval

## 6. Proof Pack 系統

Proof Pack 係成個 luxury resale 生意嘅保護罩。

每件 luxury item 要保存：

- source record
- receipt / chat record
- serial/code 如有
- detail photos
- flaw photos
- packing video
- parcel weight
- tracking
- payment proof
- face-to-face confirmation，香港面交時用

已實作：

- proof pack schema
- proof audit
- proof checklist
- proof score

Proof Score：

- Strong：可以 publish + promote
- Medium：可以小心 listing
- Weak：draft / manual review
- No proof：不可推 luxury

## 7. 假貨指控防守

如果客人話假：

AI 唔會自動認錯。

AI 只會：

- escalate
- 生成草稿
- 要 founder approve
- 提醒保存證據

防守資料：

- listing description
- product photos
- flaw photos
- proof pack
- packing video
- tracking
- payment proof
- buyer chat
- platform case detail

英國：

- eBay/TikTok/Shopify case
- chargeback evidence
- tracked delivery
- parcel weight

香港：

- Carousell / IG / WhatsApp 對話
- FPS / PayMe proof
- SF waybill
- face-to-face confirmation

## 8. AI Agent Team

已設計/實作嘅 Agent 角色：

- Founder / CEO Agent
- UK Market Manager
- HK Market Manager
- Buyer Agent
- Proof Agent
- Listing Agent
- Translation Agent
- Video Factory Agent
- Live Ops Agent
- Customer Support Agent
- CRM Agent
- Community Growth Agent
- Paid Acquisition Agent
- Discord + Snapchat Agent
- Dispute Agent
- FX Pricing Agent
- Finance Agent

重點：

AI 唔係亂自動覆晒所有嘢。

高風險問題：

- fake claim
- refund
- chargeback
- threat
- legal question
- high-value discount

全部要 founder approval。

## 9. 影片系統

每件貨可以變成：

- TikTok short video
- IG Reels
- YouTube Shorts
- product detail clip
- close-up clip
- flaw clip
- styling clip
- proof/trust clip
- live preview
- WhatsApp VIP preview

已實作：

- video schema
- video pack generator
- daily video calendar
- UK English / HK Cantonese 支援
- luxury / budget 不同語氣

## 10. AI Live Commerce

直播唔係一開波就亂講。

流程分三段：

### 直播前

- live trailer
- VIP preview
- product order
- proof check
- live script

### 直播中

- show product
- close-up
- flaw
- price
- delivery
- CTA
- moderator 記低問題

### 直播後

- cut highlights
- Q&A clips
- follow up SKU requests
- update sold/still available
- record views / DMs / clicks / sales / risk

## 11. 搵客系統

主力：

- TikTok content
- TikTok live
- TikTok ads
- Shopify retargeting

輔助：

- Discord VIP
- Snapchat
- WhatsApp
- Instagram
- eBay
- Carousell
- Pinterest

舊客：

- 只可以 contact 有 marketing consent 嘅人
- risk buyer 要排除
- budget buyer 同 luxury buyer 分開

## 12. Discord + Snapchat

Discord：

- VIP drops
- live reminder
- proof education
- support
- community retention

Snapchat：

- budget fashion story ads
- youth discovery
- old buyer reactivation
- short vertical creative

注意：

Discord / Snapchat 係 support channel。

主線仍然係：

- Shopify = commerce base
- TikTok = attention engine

## 13. 已經做咗嘅技術功能

Monorepo 已包括：

- `packages/db`
- `packages/agents`
- `services/product-proof`
- `services/listing-crosspost`
- `services/video-factory`
- `services/content-live`
- `services/live-ops`
- `services/customer-support-crm`
- `services/acquisition-growth`
- `services/platform-connectors`
- `services/risk-legal`
- `services/finance-analytics`
- `services/order-fulfillment`
- `services/sourcing-engine`
- `apps/control-center`

已通過：

- `npm run check`
- `npm run test:scenarios`

## 14. 主要輸出文件

HTML slide deck：

- `docs/slides/shopify-tiktok-investor-deck.html`

PowerPoint SAFE 版本：

- `docs/ppt/Shopify_TikTok_AI_Luxury_Resale_OS_SAFE.pptx`

完整總結：

- `docs/SHOPIFY_TIKTOK_FULL_SUMMARY.md`
- `docs/SHOPIFY_TIKTOK_FULL_SUMMARY.docx`

## 15. 下一步

最合理順序：

1. 用 HTML deck 先展示/改內容。
2. 用 SAFE PPTX 做可開嘅 PowerPoint 版本。
3. 接 Shopify 真 API。
4. 接 OpenAI 生成文案/客服/影片 script。
5. 接 TikTok Events / Ads plan。
6. 等 TikTok Shop API approval，再接 TikTok Shop。
7. 做真正 control center UI。

## 16. 最重要提醒

呢個方向係可做，但唔可以走偏：

- 唔賣假貨
- 唔扮官方授權
- 唔假 review
- 唔假 sold out
- 唔混 luxury 同 budget
- 唔自動處理高風險爭議

真正護城河係：

> 供應鏈 + proof + content output + old buyer CRM + Shopify/TikTok loop。

