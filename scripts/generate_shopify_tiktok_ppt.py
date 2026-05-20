from pathlib import Path

import generate_pro_ppt as deck


deck.OUT = Path(__file__).resolve().parents[1] / "docs" / "ppt" / "Shopify_TikTok_AI_Luxury_Resale_OS_PRO.pptx"

deck.slides = [
    {
        "layout": "cover",
        "title": "Shopify + TikTok AI Luxury Resale OS",
        "subtitle": "UK + Hong Kong investor / partner deck",
        "bullets": ["Shopify = asset base", "TikTok = growth engine", "AI = operating layer"]
    },
    {
        "layout": "statement",
        "kicker": "THE THESIS",
        "title": "Shopify controls the asset. TikTok controls the attention.",
        "body": "One founder uses AI to turn sourced products into proof packs, Shopify product records, TikTok videos, live scripts, ads, CRM tasks, fulfilment checklists, and dispute evidence.",
        "chips": ["Shopify main hub", "TikTok main growth", "UK + HK", "Proof-first"]
    },
    {
        "layout": "two_market",
        "title": "Two Markets, One Main Loop",
        "left_title": "United Kingdom",
        "right_title": "Hong Kong",
        "left": ["GBP pricing", "Shopify UK + TikTok Shop UK", "Tracked Royal Mail / Evri / DPD", "English TikTok live scripts"],
        "right": ["HKD pricing", "Shopify HK + short-content funnel", "SF Express / FPS / PayMe proof", "Cantonese VIP conversion"]
    },
    {
        "layout": "split_brand",
        "title": "Luxury and Budget Stay Separate",
        "left_title": "Luxury Resale",
        "right_title": "Budget Fashion",
        "left": ["Genuine second-hand goods", "Proof pack required", "Premium trust positioning", "Condition and flaws shown clearly"],
        "right": ["Affordable styling pieces", "No designer-product claim", "Old buyer bundles", "Separate collection and tone"]
    },
    {
        "layout": "flow",
        "title": "Shopify + TikTok Operating Loop",
        "steps": ["Source", "Proof", "Shopify", "TikTok", "Live", "CRM", "Defence"],
        "caption": "Every item moves through proof, commerce, content, live selling, follow-up, and evidence before scale."
    },
    {
        "layout": "dashboard",
        "title": "Founder Command Center",
        "cards": [
            ("Shopify", "Products ready\nDrafts blocked\nCollections split"),
            ("TikTok", "Hooks ready\nLive scripts\nAd briefs"),
            ("Risk", "Proof gaps\nManual reviews\nDispute queue"),
            ("Money", "ROI by SKU\nFees + shipping\nRefund reserve")
        ]
    },
    {
        "layout": "proof",
        "title": "Proof Pack System",
        "items": ["Source record", "Receipt / chat", "Serial/code", "Detail photos", "Flaw photos", "Packing/tracking"],
        "caption": "The company does not fight risk with claims. It fights risk with saved records."
    },
    {
        "layout": "metrics",
        "title": "Proof Score Gate",
        "metrics": [("Strong", "80+"), ("Medium", "55+"), ("Weak", "Draft"), ("No proof", "Block"), ("Founder", "Approve")]
    },
    {
        "layout": "matrix",
        "title": "Shopify Payload",
        "rows": [
            ("Core", "SKU", "Price", "Stock", "Currency"),
            ("Trust", "Proof score", "Proof summary", "Condition", "Warnings"),
            ("Brand", "Luxury", "Budget", "UK", "HK"),
            ("Action", "Draft", "Ready", "Sync", "CRM")
        ]
    },
    {
        "layout": "video",
        "title": "TikTok Video Factory",
        "body": "Every product becomes TikTok hooks, scripts, shot lists, captions, live talking points, proof clips, and ad angles. Weak-proof luxury items go to manual review.",
        "stats": [("10-20", "assets per item"), ("1", "live script"), ("6", "event types"), ("0", "fake claims")]
    },
    {
        "layout": "phone",
        "title": "TikTok Live Commerce",
        "bullets": ["Hook in the first two seconds", "Show full item and close-ups", "State condition and delivery", "Escalate authenticity or refund questions"],
        "screen": ["LIVE DROP", "SKU UK-LUX-001", "Proof score: strong", "DM SKU / Shop link"]
    },
    {
        "layout": "revenue",
        "title": "Customer Acquisition Engine",
        "cards": [
            ("1", "TikTok discovery", "Short video and live previews"),
            ("2", "Shopify conversion", "Product pages, checkout, CRM"),
            ("3", "Old buyers", "Consent-based reactivation"),
            ("4", "VIP channels", "Discord, WhatsApp, Snapchat support")
        ]
    },
    {
        "layout": "matrix",
        "title": "TikTok Ads + Events",
        "rows": [
            ("Funnel", "Awareness", "Traffic", "Live viewers", "Retargeting"),
            ("Events", "product_view", "add_to_cart", "purchase", "message_click"),
            ("Content", "Hook", "Proof", "Condition", "CTA"),
            ("Safety", "Consent", "No fake scarcity", "No fake review", "Risk exclude")
        ]
    },
    {
        "layout": "support",
        "title": "AI Customer Support",
        "safe": ["Condition", "Size", "Delivery", "Payment", "More photos", "Budget requests"],
        "escalate": ["Fake claim", "Refund", "Chargeback", "Threat", "High-value discount", "Legal question"]
    },
    {
        "layout": "risk",
        "title": "Fake-Claim Defence",
        "risks": ["Unsupported claim", "Item switching", "Chargeback", "Platform case", "Public argument"],
        "controls": ["Proof score", "Return matching", "Evidence pack", "Founder approval", "Private case flow"]
    },
    {
        "layout": "cards",
        "title": "AI Agent Team",
        "cards": [
            ("Buyer", "Scores inventory before cash is spent"),
            ("Proof", "Builds evidence packs and proof score"),
            ("Shopify", "Creates product hub payloads"),
            ("TikTok", "Creates video, live and ads payloads"),
            ("Support", "Drafts safe replies and escalates"),
            ("Finance", "Tracks fees, shipping, reserve and ROI")
        ]
    },
    {
        "layout": "two_market",
        "title": "UK Workflow",
        "left_title": "Commerce",
        "right_title": "Risk",
        "left": ["Shopify UK in GBP", "TikTok Shop UK where approved", "Tracked delivery", "English content"],
        "right": ["Packing video", "Parcel weight", "Tracking evidence", "Platform case pack"]
    },
    {
        "layout": "two_market",
        "title": "Hong Kong Workflow",
        "left_title": "Commerce",
        "right_title": "Risk",
        "left": ["Shopify HK in HKD", "Short video + IG/WhatsApp", "Carousell support", "SF delivery"],
        "right": ["FPS/PayMe proof", "SF waybill", "Face-to-face confirmation", "Cantonese support"]
    },
    {
        "layout": "roadmap",
        "title": "90-Day Roadmap",
        "phases": [
            ("Days 1-30", "Proof database\nShopify hub\nTikTok content tests"),
            ("Days 31-60", "Live drops\nCRM loops\nEvent tracking"),
            ("Days 61-90", "Partner pilot\nAgency offer\nAnalytics dashboard")
        ]
    },
    {
        "layout": "metrics",
        "title": "Daily Success Metrics",
        "metrics": [("Payloads", "10+"), ("TikToks", "20+"), ("Live", "1"), ("ATC", "Track"), ("Risk", "0 missed")]
    },
    {
        "layout": "matrix",
        "title": "Shopify Collections",
        "rows": [
            ("Luxury", "Proof strong", "Condition clear", "Premium pages", "Trust copy"),
            ("Budget", "Style-led", "No designer claim", "Bundles", "Old buyers"),
            ("UK", "GBP", "Tracked", "English", "TikTok Shop"),
            ("HK", "HKD", "SF/FPS", "Cantonese", "VIP drops")
        ]
    },
    {
        "layout": "video",
        "title": "One Product to TikTok Assets",
        "body": "A single SKU becomes hooks, product detail clips, close-ups, styling edits, proof/trust clips, live preview, ad angle, and retargeting creative.",
        "stats": [("1", "SKU"), ("8", "formats"), ("2", "markets"), ("24h", "reuse loop")]
    },
    {
        "layout": "support",
        "title": "Old Buyer Reactivation",
        "safe": ["Consent buyers", "VIP buyers", "Budget buyers", "Video engagers", "Shopify visitors", "Live viewers"],
        "escalate": ["No consent", "Risk buyer", "Chargeback history", "Threats", "Fake claim history", "Policy risk"]
    },
    {
        "layout": "two_market",
        "title": "Discord + Snapchat Support",
        "left_title": "Discord VIP",
        "right_title": "Snapchat Growth",
        "left": ["VIP drops", "Proof education", "Live reminders", "Support channels"],
        "right": ["Story ads", "Budget fashion hooks", "Youth discovery", "Old-buyer retargeting"]
    },
    {
        "layout": "risk",
        "title": "Platform Ban Protection",
        "risks": ["Counterfeit-coded wording", "Fake review", "False urgency", "Unsupported claims", "Mixed brand streams"],
        "controls": ["Forbidden wording guard", "No fake buyer pressure", "Real stock only", "Proof score gate", "Separate collections"]
    },
    {
        "layout": "dashboard",
        "title": "KPI Dashboard Mockup",
        "cards": [
            ("Traffic", "Views\nSaves\nDMs"),
            ("Commerce", "Product views\nAdd to cart\nPurchase"),
            ("Live", "Viewers\nSKU requests\nFollow-up"),
            ("Risk", "Refunds\nDisputes\nWeak proof")
        ]
    },
    {
        "layout": "flow",
        "title": "Connector Rollout",
        "steps": ["Mock", "Review", "Token", "Real API", "Monitor", "Scale", "Audit"],
        "caption": "The system runs safely in mock mode first, then moves to real API mode only after tokens and approval are ready."
    },
    {
        "layout": "matrix",
        "title": "API Priority",
        "rows": [
            ("Main", "Shopify", "TikTok", "OpenAI", "Events"),
            ("Support", "Discord", "Snapchat", "Instagram", "WhatsApp"),
            ("Market", "eBay", "Carousell", "Pinterest", "Meta"),
            ("Payments", "Stripe", "PayPal", "FPS/PayMe", "Platform checkout")
        ]
    },
    {
        "layout": "proof",
        "title": "Return Matching",
        "items": ["Original photos", "Serial/code", "Packing video", "Parcel weight", "Return photos", "Case evidence"],
        "caption": "A return is not approved blindly. The returned item is matched against the original evidence pack."
    },
    {
        "layout": "metrics",
        "title": "Investor View",
        "metrics": [("Asset", "Shopify"), ("Growth", "TikTok"), ("Moat", "Proof"), ("Scale", "AI"), ("Option", "Agency")]
    },
    {
        "layout": "revenue",
        "title": "Partnership Ask",
        "cards": [
            ("1", "Inventory partners", "Verified stock and sourcing access"),
            ("2", "Growth partners", "TikTok live, KOC and paid traffic"),
            ("3", "Agency clients", "Resale shops needing AI live/content ops"),
            ("4", "Capital partners", "Fund controlled inventory tests")
        ]
    },
    {
        "layout": "outlook",
        "title": "Why This Can Win",
        "points": ["Most resellers are still manual", "Trust and proof are the moat", "TikTok rewards repeatable content", "Shopify compounds customer and product data", "The same OS can become an agency product"]
    }
]


if __name__ == "__main__":
    deck.main()
