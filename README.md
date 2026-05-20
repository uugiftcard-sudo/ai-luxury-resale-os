# AI Luxury Resale OS

UK + Hong Kong AI one-person company OS for genuine second-hand luxury resale, budget fashion separation, AI live commerce, proof packs, cross-posting, bilingual support, dispute protection, and a Shopify + TikTok main-platform growth loop.

## What is included

- Monorepo skeleton for apps, services, shared packages, playbooks, and scripts.
- Shared data schema with `market`, `currency`, `language`, and `platform`.
- Product proof pack engine for UK/HK anti-fake-claim evidence.
- Proof score gate that blocks weak-proof luxury items from Shopify luxury publishing and TikTok promotion.
- Shopify main hub mock connector for product payloads, collections, storefront split, proof summaries, and UK/HK currency.
- TikTok main growth mock connector for short-video payloads, live talking points, ad/event planning, and manual review gates.
- Sourcing engine for buy/watch/reject decisions before cash is spent.
- Listing templates for UK and Hong Kong platforms.
- Bilingual content/live script generator.
- Video factory for TikTok/Reels/Shorts/Pinterest/Carousell/WhatsApp scripts, shot lists, captions, and daily video calendars.
- AI customer support with escalation rules.
- Order fulfilment workflow for payment, packing evidence, tracking, SF Express, and face-to-face handover.
- Live operations run-of-show for before/during/after live selling.
- Risk/legal template library for UK/HK workflows.
- Finance analytics with GBP/HKD and FX support.
- PPTX deck generator for the 18-slide business/system plan.
- `.env.example` for future real API integrations without committing secrets.

## Quick commands

```bash
npm install
npm run check
npm run test:scenarios
python3 scripts/generate_ppt.py
```

The generated deck is written to `docs/ppt/AI_Luxury_Resale_OS_UK_HK.pptx`.

## Shopify + TikTok main loop

The first real build priority is:

- **Shopify:** central product hub, luxury/budget storefront separation, proof summary, stock, checkout, and CRM.
- **TikTok:** main traffic engine for short video, live selling, TikTok Shop UK, ads, and retargeting.
- **Other channels:** eBay, Carousell, Instagram, Discord, Snapchat, WhatsApp, and Pinterest are support channels.

The connector layer is mock-first. It can generate safe Shopify and TikTok payloads without tokens, then move to real mode once API keys are added locally to `.env`.

## Important boundary

This system is designed for genuine second-hand goods and budget fashion that does not use fake logos, replica branding, or misleading designer claims. Legal templates are operational drafts and should be reviewed by qualified UK/HK counsel before launch.

## Video system

The video layer turns every product into a traffic package:

- Product detail clips, styling clips, proof/trust clips, live previews, VIP previews, and post-live highlight ideas.
- UK English mode for TikTok, Reels, YouTube Shorts, Pinterest, Shopify, and live selling.
- Hong Kong Cantonese/Traditional Chinese mode for Carousell, IG, WhatsApp/Telegram VIP drops, and SF/face-to-face workflows.
- Separate tone for genuine luxury resale and budget fashion so trust is not mixed.
- Customer-facing scripts avoid counterfeit-coded wording, fake social proof, false urgency, and unsupported authenticity promises.

## Missing-function expansion

The OS now covers more than content generation:

- **Sourcing:** Decide whether a lead is worth buying based on margin, evidence, shipping, fees, and risk.
- **Order fulfilment:** Build a safe dispatch/handover checklist after payment.
- **Live operations:** Prepare the before/during/after live workflow and escalation rules.
- **CRM follow-up:** Turn buyer messages into warm lead, budget buyer, VIP, discount lead, or risk buyer tasks.
- **Main-platform connectors:** Prepare Shopify and TikTok payloads with proof gates, channel-specific warnings, and mock/real-ready status.
