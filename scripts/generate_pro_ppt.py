from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ppt" / "AI_Luxury_Resale_OS_UK_HK_PRO.pptx"

W = 12192000
H = 6858000

INK = "111827"
PAPER = "F6F1E8"
CARD = "FFFFFF"
GOLD = "C8A45D"
TEAL = "0F766E"
MUTED = "64748B"
LINE = "E7DDCC"
ROSE = "8A4A3F"
BLUE = "1D4ED8"


slides = [
    {
        "layout": "cover",
        "title": "AI Luxury Resale OS",
        "subtitle": "UK + Hong Kong dual-market commerce system",
        "bullets": ["Proof-first resale", "AI video + live selling", "One founder + AI operator team"]
    },
    {
        "layout": "statement",
        "kicker": "THE IDEA",
        "title": "Not a shop. A resale operating system.",
        "body": "One founder controls sourcing, proof, listing, video, live selling, customer support, fulfilment, CRM, risk, and finance from one AI-assisted command centre.",
        "chips": ["UK", "Hong Kong", "Luxury resale", "Budget fashion"]
    },
    {
        "layout": "two_market",
        "title": "Two Markets, One Backend",
        "left_title": "United Kingdom",
        "right_title": "Hong Kong",
        "left": ["GBP 50-800 items", "eBay, TikTok Shop, Shopify, IG", "Royal Mail / Evri / DPD tracked", "English content + live scripts"],
        "right": ["HKD 500-8,000 items", "Carousell, IG, WhatsApp, Shopify HK", "FPS / PayMe / SF Express", "Cantonese + Traditional Chinese"]
    },
    {
        "layout": "split_brand",
        "title": "Two Brands Must Stay Separate",
        "left_title": "Luxury Resale",
        "right_title": "Budget Fashion",
        "left": ["Genuine second-hand goods", "Proof pack required", "Premium trust presentation", "Condition and flaws shown clearly"],
        "right": ["Trend and styling pieces", "No fake logos or replica claims", "Old buyers and bundle offers", "Fast, simple, affordable"]
    },
    {
        "layout": "flow",
        "title": "Product Journey",
        "steps": ["Source", "Proof", "List", "Film", "Live", "Ship", "CRM"],
        "caption": "Every item moves through the same safety and growth pipeline before it becomes cashflow."
    },
    {
        "layout": "dashboard",
        "title": "Founder Command Center",
        "cards": [
            ("Today", "Push 12 listings\nFilm 8 clips\nRun HK VIP drop"),
            ("Risk", "2 proof gaps\n1 dispute review\n0 blocked orders"),
            ("Growth", "10 video assets\n3 live scripts\n24 CRM tasks"),
            ("Money", "ROI by SKU\nFees + shipping\nRefund reserve")
        ]
    },
    {
        "layout": "cards",
        "title": "AI Operator Team",
        "cards": [
            ("Buyer", "Scores leads before cash is spent"),
            ("Proof", "Builds evidence packs for every luxury item"),
            ("Listing", "Writes channel-specific sales copy"),
            ("Video", "Turns items into clips and live assets"),
            ("Support", "Answers safe questions, escalates risk"),
            ("Finance", "Tracks profit, fees, FX, and ROI")
        ]
    },
    {
        "layout": "proof",
        "title": "Proof Pack: The Trust Engine",
        "items": ["Source record", "Receipt / chat record", "Serial or label details", "Detail + flaw photos", "Packing video", "Tracking / payment proof"],
        "caption": "When a buyer claims an item is wrong, the system responds with records, not arguments."
    },
    {
        "layout": "matrix",
        "title": "Cross-Posting Engine",
        "rows": [
            ("UK Sales", "eBay UK", "TikTok Shop", "Shopify UK", "Instagram"),
            ("UK Growth", "Vinted", "Depop", "Pinterest", "Shorts"),
            ("HK Sales", "Carousell", "IG DM", "WhatsApp", "Shopify HK"),
            ("HK Growth", "Facebook", "Telegram", "Shorts", "VIP group")
        ]
    },
    {
        "layout": "video",
        "title": "AI Video Factory",
        "body": "Every item becomes a video pack: product detail, close-up, flaw, styling, price story, proof/trust, live preview, and post-live cutdowns.",
        "stats": [("10-20", "clips per item"), ("20-50", "clips per live"), ("2", "languages"), ("4", "audiences")]
    },
    {
        "layout": "phone",
        "title": "Live Commerce Experience",
        "bullets": ["AI host script before live", "Moderator marks buyer questions", "Risk comments escalate to founder", "Post-live clips create long-tail traffic"],
        "screen": ["Tonight's Drop", "Gucci bag | B grade", "Proof available", "DM SKU: UK-LUX-001"]
    },
    {
        "layout": "support",
        "title": "AI Customer Support",
        "safe": ["Condition", "Size", "Payment", "Delivery", "More photos", "Budget items"],
        "escalate": ["Fake claim", "Refund", "Chargeback", "Threat", "High-value dispute", "Large discount"]
    },
    {
        "layout": "revenue",
        "title": "Customer Acquisition Engine",
        "cards": [
            ("1", "Old buyers", "Reactivate with consent-based offers"),
            ("2", "Video engagers", "Retarget viewers from clips and stories"),
            ("3", "Live viewers", "Bring warm viewers back to drops"),
            ("4", "VIP buyers", "Move best customers into private channels")
        ]
    },
    {
        "layout": "two_market",
        "title": "Discord + Snapchat Growth",
        "left_title": "Discord VIP Club",
        "right_title": "Snapchat Funnel",
        "left": ["VIP drops and early previews", "Onboarding roles by buyer type", "Proof/trust education", "Live reminders and support"],
        "right": ["Vertical story content", "Budget fashion and styling hooks", "Old-buyer reactivation", "Pixel/custom/lookalike audiences where allowed"]
    },
    {
        "layout": "matrix",
        "title": "Advertising Channel Map",
        "rows": [
            ("Retargeting", "Meta/IG", "TikTok", "Snapchat", "Email"),
            ("Community", "Discord", "WhatsApp", "Telegram", "VIP drops"),
            ("Discovery", "Shorts", "Pinterest", "Snap Story", "KOC"),
            ("Conversion", "Live Ads", "Shopify", "eBay", "Carousell")
        ]
    },
    {
        "layout": "revenue",
        "title": "Revenue Model",
        "cards": [
            ("1", "Resale cashflow", "Buy low, sell safely with proof"),
            ("2", "Budget fashion", "Serve old buyers without harming luxury trust"),
            ("3", "AI live agency", "Operate live/content for other sellers"),
            ("4", "Future SaaS", "Package the OS for resellers")
        ]
    },
    {
        "layout": "risk",
        "title": "Risk Controls",
        "risks": ["Counterfeit claims", "Item switching", "Payment disputes", "Platform bans", "Supply instability"],
        "controls": ["Proof pack", "Packing evidence", "Tracked/SF delivery", "Escalation rules", "Separate brands"]
    },
    {
        "layout": "roadmap",
        "title": "90-Day Launch Roadmap",
        "phases": [
            ("Days 1-30", "Proof database\nFirst 30-80 items\nListing + video engine"),
            ("Days 31-60", "Weekly live drops\nCRM + VIP list\nUK/HK content tests"),
            ("Days 61-90", "Agency pilot\nAnalytics dashboard\nRepeatable SOP")
        ]
    },
    {
        "layout": "metrics",
        "title": "Daily Metrics",
        "metrics": [("Listings", "10-30"), ("Videos", "20-50"), ("Real interactions", "30-100"), ("Live / clips", "1+"), ("Risk review", "0 missed")]
    },
    {
        "layout": "outlook",
        "title": "Why This Can Win",
        "points": ["Most resellers are still manual", "UK and HK reward speed, trust, and content", "AI turns one item into many sales assets", "Proof-first operations protect the brand", "The same system can become an agency product"]
    },
    {
        "layout": "next",
        "title": "Next Build",
        "points": ["Replace static deck with real dashboard UI", "Add product photo upload and proof pack storage", "Connect Shopify/eBay/Carousell workflows", "Add OpenAI support agent with approval gates", "Use Canva/Figma for final brand assets once a design file/template is selected"]
    }
]


def xml_text(s: str) -> str:
    return escape(s)


def rect(sid, x, y, cx, cy, fill, line="none", radius=False, opacity=None):
    line_xml = "<a:noLine/>" if line == "none" else f'<a:ln w="12000"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>'
    alpha = f'<a:alpha val="{opacity}"/>' if opacity else ""
    return f'''<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Shape {sid}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="{'roundRect' if radius else 'rect'}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="{fill}">{alpha}</a:srgbClr></a:solidFill>{line_xml}</p:spPr></p:sp>'''


def text(sid, x, y, cx, cy, content, size=1400, color=INK, bold=False, align="l", font="Aptos", spacing=60000):
    lines = content if isinstance(content, list) else [content]
    ps = []
    for line in lines:
        ps.append(f'''<a:p><a:pPr algn="{align}"><a:spcAft><a:spcPts val="{spacing}"/></a:spcAft></a:pPr><a:r><a:rPr lang="en-US" sz="{size}" b="{1 if bold else 0}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill><a:latin typeface="{font}"/></a:rPr><a:t>{xml_text(line)}</a:t></a:r></a:p>''')
    return f'''<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="Text {sid}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>{''.join(ps)}</p:txBody></p:sp>'''


def base_bg(section=""):
    return [
        rect(2, 0, 0, W, H, PAPER),
        rect(3, 0, 0, W, 260000, INK),
        rect(4, 0, 0, 210000, H, TEAL),
        text(5, 8200000, 6420000, 3150000, 240000, "AI Luxury Resale OS | UK + HK", 820, MUTED, False, "r"),
        text(6, 700000, 450000, 2200000, 220000, section.upper(), 850, GOLD, True, "l", spacing=0)
    ]


def title_block(title, section):
    return base_bg(section) + [text(7, 700000, 760000, 10300000, 620000, title, 2600, INK, True)]


def bullet_card(start_id, x, y, w, h, bullets):
    shapes = [rect(start_id, x, y, w, h, CARD, LINE, True)]
    lines = [f"• {b}" for b in bullets]
    shapes.append(text(start_id + 1, x + 280000, y + 300000, w - 560000, h - 560000, lines, 1450, "263142", False))
    return shapes


def slide_xml(i, slide):
    sid = 20
    layout = slide["layout"]
    shapes = []

    if layout == "cover":
        shapes += [rect(2, 0, 0, W, H, INK), rect(3, 7650000, 0, 4542000, H, TEAL), rect(4, 760000, 760000, 1830000, 360000, GOLD, radius=True)]
        shapes += [text(5, 900000, 830000, 1500000, 190000, "UK + HONG KONG", 850, INK, True, "ctr", spacing=0)]
        shapes += [text(6, 760000, 1540000, 6500000, 900000, slide["title"], 4700, "F8FAFC", True)]
        shapes += [text(7, 800000, 2780000, 6100000, 650000, slide["subtitle"], 1850, "CBD5E1")]
        x = 800000
        for b in slide["bullets"]:
            shapes += [rect(sid, x, 4300000, 2000000, 520000, "1F2937", "334155", True), text(sid + 1, x + 140000, 4450000, 1720000, 180000, b, 850, "F8FAFC", True, "ctr", spacing=0)]
            x += 2200000
            sid += 2
    elif layout == "statement":
        shapes += title_block(slide["title"], slide["kicker"])
        shapes += [rect(20, 740000, 1940000, 10400000, 2200000, CARD, LINE, True)]
        shapes += [text(21, 1100000, 2360000, 9600000, 900000, slide["body"], 2100, "263142")]
        x = 950000
        for c in slide["chips"]:
            shapes += [rect(sid, x, 4800000, 1850000, 480000, INK, radius=True), text(sid + 1, x, 4930000, 1850000, 190000, c, 900, "F8FAFC", True, "ctr", spacing=0)]
            x += 2050000
            sid += 2
    elif layout in ("two_market", "split_brand"):
        shapes += title_block(slide["title"], "strategy")
        for n, (x, t, items, color) in enumerate([(740000, slide["left_title"], slide["left"], TEAL), (6250000, slide["right_title"], slide["right"], ROSE)]):
            shapes += [rect(sid, x, 1730000, 5000000, 4100000, CARD, LINE, True), rect(sid + 1, x, 1730000, 5000000, 420000, color, radius=True)]
            shapes += [text(sid + 2, x + 280000, 1840000, 4500000, 180000, t, 1050, "FFFFFF", True)]
            shapes += bullet_card(sid + 3, x + 220000, 2300000, 4560000, 3200000, items)[1:]
            sid += 10
    elif layout == "flow":
        shapes += title_block(slide["title"], "workflow")
        x = 760000
        for idx, step in enumerate(slide["steps"], start=1):
            shapes += [rect(sid, x, 2500000, 1300000, 800000, CARD, LINE, True), text(sid + 1, x, 2700000, 1300000, 180000, f"{idx:02d}", 900, GOLD, True, "ctr", 0), text(sid + 2, x, 2980000, 1300000, 190000, step, 1050, INK, True, "ctr", 0)]
            if idx < len(slide["steps"]):
                shapes += [rect(sid + 3, x + 1340000, 2880000, 260000, 35000, GOLD)]
            x += 1530000
            sid += 4
        shapes += [text(60, 1400000, 4400000, 9200000, 450000, slide["caption"], 1650, "263142", False, "ctr")]
    elif layout == "dashboard":
        shapes += title_block(slide["title"], "command centre")
        positions = [(760000, 1800000), (6150000, 1800000), (760000, 3900000), (6150000, 3900000)]
        for (label, body), (x, y) in zip(slide["cards"], positions):
            shapes += [rect(sid, x, y, 5000000, 1650000, CARD, LINE, True), text(sid + 1, x + 260000, y + 220000, 4300000, 220000, label, 1150, GOLD, True), text(sid + 2, x + 260000, y + 620000, 4300000, 700000, body.split("\n"), 1250, INK)]
            sid += 3
    elif layout == "cards":
        shapes += title_block(slide["title"], "ai team")
        positions = [(760000, 1720000), (4300000, 1720000), (7840000, 1720000), (760000, 3950000), (4300000, 3950000), (7840000, 3950000)]
        for (label, body), (x, y) in zip(slide["cards"], positions):
            shapes += [rect(sid, x, y, 3200000, 1700000, CARD, LINE, True), rect(sid + 1, x + 230000, y + 230000, 520000, 520000, TEAL, radius=True), text(sid + 2, x + 900000, y + 250000, 2000000, 200000, label, 1250, INK, True), text(sid + 3, x + 900000, y + 650000, 2000000, 600000, body, 1050, MUTED)]
            sid += 4
    elif layout == "proof":
        shapes += title_block(slide["title"], "trust")
        shapes += [rect(20, 760000, 1700000, 10300000, 3450000, CARD, LINE, True)]
        positions = [(1150000, 2050000), (4200000, 2050000), (7250000, 2050000), (1150000, 3500000), (4200000, 3500000), (7250000, 3500000)]
        for item, (x, y) in zip(slide["items"], positions):
            shapes += [rect(sid, x, y, 2500000, 780000, "F8FAFC", LINE, True), text(sid + 1, x + 180000, y + 245000, 2150000, 180000, item, 950, INK, True, "ctr", 0)]
            sid += 2
        shapes += [text(50, 1200000, 5480000, 9200000, 350000, slide["caption"], 1350, MUTED, False, "ctr")]
    elif layout == "matrix":
        shapes += title_block(slide["title"], "distribution")
        y = 1750000
        for row in slide["rows"]:
            shapes += [rect(sid, 780000, y, 10400000, 760000, CARD, LINE, True), text(sid + 1, 1080000, y + 250000, 1800000, 160000, row[0], 950, GOLD, True)]
            x = 3200000
            for cell in row[1:]:
                shapes += [rect(sid + 2, x, y + 180000, 1700000, 360000, "F8FAFC", "E2E8F0", True), text(sid + 3, x, y + 275000, 1700000, 120000, cell, 760, INK, True, "ctr", 0)]
                x += 1900000
                sid += 2
            y += 920000
            sid += 4
    elif layout == "video":
        shapes += title_block(slide["title"], "video engine")
        shapes += [rect(20, 760000, 1850000, 5900000, 2300000, CARD, LINE, True), text(21, 1100000, 2350000, 5200000, 900000, slide["body"], 1700, "263142")]
        x = 7050000
        y = 1800000
        for stat, label in slide["stats"]:
            shapes += [rect(sid, x, y, 1850000, 1400000, INK, radius=True), text(sid + 1, x, y + 315000, 1850000, 260000, stat, 2300, GOLD, True, "ctr", 0), text(sid + 2, x, y + 840000, 1850000, 220000, label, 850, "F8FAFC", True, "ctr", 0)]
            x += 2100000
            if x > 10000000:
                x = 7050000
                y += 1600000
            sid += 3
    elif layout == "phone":
        shapes += title_block(slide["title"], "live commerce")
        shapes += bullet_card(20, 760000, 1850000, 5400000, 3600000, slide["bullets"])
        shapes += [rect(30, 7600000, 1500000, 2550000, 4550000, INK, "334155", True), rect(31, 7880000, 1900000, 1990000, 3600000, "F8FAFC", radius=True)]
        y = 2200000
        for line in slide["screen"]:
            shapes += [text(sid, 8050000, y, 1650000, 160000, line, 850, INK, True, "ctr", 0)]
            y += 680000
            sid += 1
    elif layout == "support":
        shapes += title_block(slide["title"], "customer ops")
        for x, title, items, color in [(760000, "AI can answer", slide["safe"], TEAL), (6250000, "Escalate to founder", slide["escalate"], ROSE)]:
            shapes += [rect(sid, x, 1750000, 5000000, 3850000, CARD, LINE, True), text(sid + 1, x + 280000, 2070000, 4500000, 200000, title, 1350, color, True)]
            shapes += bullet_card(sid + 2, x + 250000, 2520000, 4500000, 2600000, items)[1:]
            sid += 5
    elif layout == "revenue":
        shapes += title_block(slide["title"], "business model")
        x = 760000
        for num, label, body in slide["cards"]:
            shapes += [rect(sid, x, 1850000, 2500000, 3350000, CARD, LINE, True), text(sid + 1, x + 250000, 2150000, 500000, 300000, num, 1800, GOLD, True), text(sid + 2, x + 250000, 2750000, 1950000, 330000, label, 1250, INK, True), text(sid + 3, x + 250000, 3380000, 1950000, 700000, body, 1050, MUTED)]
            x += 2700000
            sid += 4
    elif layout == "risk":
        shapes += title_block(slide["title"], "protection")
        shapes += [text(20, 1100000, 1730000, 4200000, 230000, "Main risks", 1300, ROSE, True), text(21, 6500000, 1730000, 4200000, 230000, "Controls", 1300, TEAL, True)]
        y = 2200000
        for r, c in zip(slide["risks"], slide["controls"]):
            shapes += [rect(sid, 980000, y, 4500000, 520000, CARD, LINE, True), text(sid + 1, 1230000, y + 150000, 4000000, 140000, r, 950, INK, True)]
            shapes += [rect(sid + 2, 6400000, y, 4500000, 520000, CARD, LINE, True), text(sid + 3, 6650000, y + 150000, 4000000, 140000, c, 950, INK, True)]
            y += 680000
            sid += 4
    elif layout == "roadmap":
        shapes += title_block(slide["title"], "roadmap")
        x = 800000
        for phase, body in slide["phases"]:
            shapes += [rect(sid, x, 2050000, 3250000, 2850000, CARD, LINE, True), rect(sid + 1, x, 2050000, 3250000, 420000, GOLD, radius=True), text(sid + 2, x, 2160000, 3250000, 160000, phase, 900, INK, True, "ctr", 0), text(sid + 3, x + 300000, 2750000, 2650000, 900000, body.split("\n"), 1150, "263142")]
            x += 3550000
            sid += 4
    elif layout == "metrics":
        shapes += title_block(slide["title"], "scoreboard")
        x = 780000
        for label, value in slide["metrics"]:
            shapes += [rect(sid, x, 2050000, 2050000, 2200000, INK, radius=True), text(sid + 1, x, 2550000, 2050000, 320000, value, 2500, GOLD, True, "ctr", 0), text(sid + 2, x, 3300000, 2050000, 220000, label, 820, "F8FAFC", True, "ctr", 0)]
            x += 2180000
            sid += 3
    elif layout in ("outlook", "next"):
        shapes += title_block(slide["title"], "future")
        shapes += bullet_card(20, 760000, 1750000, 10400000, 3900000, slide["points"])
    else:
        shapes += title_block(slide["title"], "deck")
        shapes += bullet_card(20, 760000, 1700000, 10400000, 3900000, slide.get("bullets", []))

    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>{''.join(shapes)}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''


def content_types():
    overrides = "\n".join(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(1, len(slides) + 1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>{overrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'''


def root_rels():
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''


def presentation_xml():
    ids = "".join(f'<p:sldId id="{255+i}" r:id="rId{i}"/>' for i in range(1, len(slides) + 1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{len(slides)+1}"/></p:sldMasterIdLst><p:sldIdLst>{ids}</p:sldIdLst><p:sldSz cx="{W}" cy="{H}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>'''


def presentation_rels():
    rels = "".join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>' for i in range(1, len(slides) + 1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}<Relationship Id="rId{len(slides)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId{len(slides)+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>'''


MINIMAL_MASTER = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles/></p:sldMaster>'''
MINIMAL_LAYOUT = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'''
MINIMAL_THEME = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="AI Luxury Resale OS Pro"><a:themeElements><a:clrScheme name="Luxury"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="263142"/></a:dk2><a:lt2><a:srgbClr val="F6F1E8"/></a:lt2><a:accent1><a:srgbClr val="C8A45D"/></a:accent1><a:accent2><a:srgbClr val="0F766E"/></a:accent2><a:accent3><a:srgbClr val="8A4A3F"/></a:accent3><a:accent4><a:srgbClr val="1D4ED8"/></a:accent4><a:accent5><a:srgbClr val="64748B"/></a:accent5><a:accent6><a:srgbClr val="111827"/></a:accent6><a:hlink><a:srgbClr val="1D4ED8"/></a:hlink><a:folHlink><a:srgbClr val="8A4A3F"/></a:folHlink></a:clrScheme><a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"/></a:themeElements></a:theme>'''


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUT, "w", ZIP_DEFLATED) as pptx:
        pptx.writestr("[Content_Types].xml", content_types())
        pptx.writestr("_rels/.rels", root_rels())
        pptx.writestr("ppt/presentation.xml", presentation_xml())
        pptx.writestr("ppt/_rels/presentation.xml.rels", presentation_rels())
        pptx.writestr("ppt/slideMasters/slideMaster1.xml", MINIMAL_MASTER)
        pptx.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>''')
        pptx.writestr("ppt/slideLayouts/slideLayout1.xml", MINIMAL_LAYOUT)
        pptx.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>''')
        pptx.writestr("ppt/theme/theme1.xml", MINIMAL_THEME)
        pptx.writestr("docProps/core.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>AI Luxury Resale OS UK HK PRO</dc:title><dc:creator>Codex</dc:creator></cp:coreProperties>''')
        pptx.writestr("docProps/app.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>''')
        for idx, slide in enumerate(slides, start=1):
            pptx.writestr(f"ppt/slides/slide{idx}.xml", slide_xml(idx, slide))
            pptx.writestr(f"ppt/slides/_rels/slide{idx}.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>''')
    print(f"Generated {OUT}")


if __name__ == "__main__":
    main()
