# Platform Connectors SOP

## 1. Main Platform Rule

Shopify and TikTok are the main system:

- Shopify = product hub, checkout, stock, proof summary, customer tags.
- TikTok = short video, live selling, TikTok Shop UK, ads, retargeting.

Other channels support the loop:

- eBay and Carousell help cashflow and marketplace search.
- Instagram, Discord, Snapchat, WhatsApp, Telegram, Pinterest help attention and retention.

## 2. Mock Mode First

The first connector version runs in mock mode:

- No API token needed.
- Payloads are generated and tested locally.
- Risk warnings are shown before anything is published.
- Founder approval is required for disputes, refunds, authenticity questions, and chargeback-sensitive replies.

Real API mode starts only after local `.env` is filled. Never commit `.env`.

## 3. Shopify Payload Rules

Every product sent to Shopify must include:

- SKU
- market: UK or HK
- currency: GBP or HKD
- storefront: luxury or budget
- collection handles
- price
- condition notes
- proof summary
- warnings

Luxury resale cannot publish to the luxury storefront if:

- no proof pack exists
- proof score is weak
- required evidence is missing
- customer-facing wording contains blocked counterfeit-coded terms

Budget fashion must stay in budget collections and must not pretend to be a designer product.

## 4. TikTok Payload Rules

TikTok payloads cover:

- TikTok Shop UK listing prep
- short-video hooks
- live talking points
- proof-first notes
- ads creative brief
- event plan

TikTok copy must never use:

- unsupported authenticity promises
- fake reviews
- fake buyer pressure
- fake sold-out claims
- counterfeit-coded wording

Weak-proof luxury items go to manual review, not promotion.

## 5. Event Tracking Plan

Plan these TikTok/Shopify events:

- product_view
- add_to_cart
- purchase
- message_click
- video_view
- live_view

Use SKU, market, brand stream, and proof grade in analytics where platform policy allows.

## 6. Daily Boss Workflow

1. Add product and proof pack.
2. Check proof score.
3. Generate Shopify payload.
4. Generate TikTok video/live payload.
5. Review warnings.
6. Publish only if ready.
7. Track views, DMs, clicks, add-to-cart, purchase, refund, and dispute rate.
