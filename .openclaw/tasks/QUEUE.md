# CLOTH — Task Queue

## Ready (prioritized backlog)

- [ ] **Add HK-BUD-001 proof pack** — HK-BUD-001 (Korean Style Cropped Blazer) is listed but needs a proof pack created before it can enter the luxury pipeline (note: budget fashion doesn't require proof, but the control center flags it — confirm it belongs in budget stream)
- [ ] **Score new sourcing leads** — Check eBay sold listings and Carousell HK for new sourcing leads; run `scoreSourcingLead()` on each; action buy/watch decisions
- [ ] **List HK-LUX-001 on Carousell HK** — Proof pack complete; generate Cantonese listing; post with proof-forward approach
- [ ] **Post HK VIP WhatsApp drop** — Preview HK-LUX-001 (Prada Nylon, HK$4,800) to WhatsApp VIP list before public Carousell listing
- [ ] **Dispatch UK-LUX-001** — Order order-uk-001 paid; pack with video, weigh parcel, ship Royal Mail tracked, update tracking
- [ ] **Dispatch HK-LUX-001** — Order order-hk-001 paid; confirm FPS payment, pack with video, ship SF Express, send tracking
- [ ] **Review Snapchat HK campaign brief** — HK budget fashion ad campaign brief ready; review and launch if within budget
- [ ] **Schedule UK evening TikTok live** — UK-LUX-001 listed; generate live run-of-show; schedule for high-traffic UK evening slot
- [ ] **Post daily community content** — HK: Carousell replies + IG story poll; UK: TikTok warm-up + eBay watcher review

## In Progress

_(nothing currently in progress — agents idle)_

## Blocked

- [ ] **API credentials needed** — Shopify UK + HK admin tokens not configured; TikTok Shop app key/secret not configured; real platform connectors cannot sync until `.env` is populated
- [ ] **Real inventory data** — System runs on sample data; founder needs to add real purchased products and source records before the control center reflects actual inventory

## Done ✓

- [x] TypeScript monorepo scaffold (apps, services, packages)
- [x] All 16 agent definitions in `@luxury/agents`
- [x] Shared types + forbidden-claim scanner in `@luxury/db`
- [x] JSON file persistence for all data collections
- [x] Proof pack scoring service (`@luxury/product-proof`)
- [x] Listing generation with compliance scan (`@luxury/listing-crosspost`)
- [x] Video factory — HK 5-asset and UK 5-asset packs
- [x] Sourcing engine with buy/watch/reject scoring
- [x] Customer support CRM with escalation routing
- [x] Order fulfilment checklists (UK tracked + HK SF + face-to-face)
- [x] Live ops run-of-show builder
- [x] Acquisition growth — audience segments + ad briefs + Discord/Snapchat funnels
- [x] Finance analytics — GBP/HKD profit calculation with FX support
- [x] Risk-legal — disclaimers, dispute checklists, prohibited rules
- [x] Control center CLI dashboard with interactive market view
- [x] All 30+ scenario tests passing
- [x] Demo script with full workflow output
