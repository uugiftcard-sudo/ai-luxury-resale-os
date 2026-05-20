from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ppt" / "AI_Luxury_Resale_OS_UK_HK.pptx"


slides = [
    ("AI One-Person Luxury Resale Company OS: UK + Hong Kong", [
        "One founder + full AI Agent Team",
        "Genuine second-hand luxury resale plus separated budget fashion",
        "UK GBP + Hong Kong HKD market modes"
    ]),
    ("Why UK + HK", [
        "UK: eBay, TikTok Shop, Shopify, Vinted, Depop demand",
        "HK: Carousell, IG, FPS/PayMe, SF Express, VIP group behaviour",
        "Two markets share the same OS but keep rules separate"
    ]),
    ("Two-Market Strategy", [
        "UK: GBP, tracked delivery, English listings, platform checkout",
        "HK: HKD, Carousell/IG/WhatsApp, FPS/PayMe, SF Express",
        "Shared proof, content, CRM, analytics, and AI agent layer"
    ]),
    ("Customer Segments", [
        "Luxury resale buyers: trust, proof, condition, premium presentation",
        "Budget fashion buyers: cheap trend pieces, fast response, bundle deals",
        "Never mix budget fashion with luxury proof-based trust"
    ]),
    ("UK Platform Map", [
        "Core: eBay UK, TikTok Shop UK, Shopify UK, Instagram",
        "Expansion: Vinted, Depop, Pinterest, YouTube Shorts",
        "Delivery: Royal Mail, Evri, DPD tracked services"
    ]),
    ("HK Platform Map", [
        "Core: Carousell HK, Instagram, Shopify HK, WhatsApp catalogue",
        "Expansion: Facebook Marketplace, TikTok/Shorts, Telegram VIP",
        "Delivery: SF Express, SF lockers, local courier, face-to-face"
    ]),
    ("AI Agent Team", [
        "CEO, COO, UK/HK Market Managers, Buyer, Proof, Listing",
        "Content, Live Host, Moderator, Support, CRM, Community",
        "Risk, Dispute, Legal Terms, Finance, Analytics, Agency Sales"
    ]),
    ("Monorepo Architecture", [
        "apps: control-center, luxury shopfront, budget shopfront, agency portal",
        "services: proof, listing, content/live, support/CRM, community, risk, finance",
        "packages: shared database schema and AI agent definitions"
    ]),
    ("Product Proof System", [
        "Source record, receipt, serial/code, detail photos, flaw photos",
        "Packing video, parcel weight, tracking, payment proof",
        "Proof pack supports fake-claim defence and return matching"
    ]),
    ("Sourcing Engine", [
        "AI Buyer scores each lead before money is spent",
        "Decision output: buy, watch, or reject",
        "Checks margin, proof available, shipping, platform fees, and risk flags"
    ]),
    ("Order Fulfilment Engine", [
        "After payment, AI creates a safe packing and delivery checklist",
        "UK: tracked delivery, packing video, parcel weight, tracking",
        "HK: FPS/PayMe proof, SF Express waybill, or face-to-face confirmation"
    ]),
    ("CRM Follow-Up Engine", [
        "Turns messages into VIP, old buyer, warm lead, discount lead, budget buyer, or risk buyer tasks",
        "Normal questions can be followed up automatically",
        "Risk buyers require founder approval before reply"
    ]),
    ("Live Ops Engine", [
        "Before live: product order, preview clips, host script, proof status",
        "During live: show condition, answer safe questions, mark strong moments",
        "After live: cut clips, follow up SKU requests, update analytics"
    ]),
    ("HK Proof + Carousell + FPS/PayMe Workflow", [
        "Carousell listing in Traditional Chinese/Cantonese tone",
        "Save FPS/PayMe screenshot, transaction reference, buyer name, time",
        "For SF/face-to-face, save tracking or confirmation messages"
    ]),
    ("UK Proof + eBay/TikTok Workflow", [
        "English listing with condition notes and tracked delivery wording",
        "Packing evidence, parcel weight, tracking, and platform case timeline",
        "Return wording must not remove statutory rights"
    ]),
    ("Content + AI Live Engine", [
        "Generate hooks, captions, short scripts, live rundowns, and clips",
        "English and Cantonese modes",
        "No fake scarcity, fake reviews, or unsupported brand claims"
    ]),
    ("AI Video Factory", [
        "Every product becomes a video pack, not just a listing",
        "Output includes hook, script, shot list, caption, hashtags, CTA",
        "Formats cover TikTok, Reels, Shorts, Pinterest, Carousell, WhatsApp, and live"
    ]),
    ("One Product Becomes 10-20 Clips", [
        "Product detail, close-up, flaw, styling, price story, proof/trust, and live preview",
        "Luxury videos focus on condition, proof, and trust",
        "Budget videos focus on styling, value, and fast buying decisions"
    ]),
    ("Product Video Engine", [
        "AI writes the shot list before filming starts",
        "Founder only needs to capture the required angles and details",
        "Each asset is saved with SKU, market, language, format, status, and performance"
    ]),
    ("Live Video Engine: Before Live", [
        "Generate tonight's live trailer",
        "Create countdown clips and VIP preview videos",
        "Prepare the AI host script and product order"
    ]),
    ("Live Video Engine: During Live", [
        "AI Host follows the product script and condition notes",
        "Moderator marks strong questions and high-interest moments",
        "Risky comments about refunds or authenticity are escalated"
    ]),
    ("Live Video Engine: After Live", [
        "Cut product highlights, Q&A clips, and still-available follow-ups",
        "Reuse clips across TikTok, Reels, Shorts, Pinterest, Carousell, and WhatsApp",
        "Measure which clips drive DMs, saves, clicks, and sales"
    ]),
    ("AI Avatar Presenter", [
        "UK English host for TikTok, IG, Shopify, and live previews",
        "Hong Kong Cantonese host for Carousell, IG, WhatsApp, and VIP drops",
        "Different tone for luxury resale and budget fashion"
    ]),
    ("AI Host Safety Rules", [
        "Do not make unsupported authenticity promises",
        "Do not invent customers, reviews, urgency, scarcity, or sales",
        "Escalate disputes, refunds, threats, and high-risk questions to the founder"
    ]),
    ("UK Video Playbook", [
        "TikTok: fast hook, price, condition, styling, SKU call-to-action",
        "Reels: outfit ideas and premium trust-building visuals",
        "Shorts/Pinterest: long-tail product discovery and resale education"
    ]),
    ("Hong Kong Video Playbook", [
        "Carousell: short Cantonese product detail and condition video",
        "IG: styling and lifestyle clips in Traditional Chinese/Cantonese tone",
        "WhatsApp/Telegram: VIP preview, hold time, FPS/PayMe, and SF options"
    ]),
    ("Luxury Resale Trust Videos", [
        "Show condition, detail photos, flaws, accessories, and proof availability",
        "Explain the proof pack without overclaiming",
        "Use calm premium tone because trust is the product"
    ]),
    ("Budget Fashion Videos", [
        "Focus on outfit ideas, fit, colour, daily use, and bundle value",
        "Keep budget fashion separate from luxury resale branding",
        "Never pretend budget items are designer goods"
    ]),
    ("Daily Video Calendar", [
        "Morning: 3 product detail clips, 2 styling clips, 1 proof/trust clip",
        "Afternoon: 5 platform clips, 1 VIP preview, 1 live reminder",
        "Evening/night: live, highlights, Q&A clips, reuse, and performance review"
    ]),
    ("Video KPIs", [
        "Views, likes, comments, DMs, saves, clicks, and sales",
        "Track which SKU, market, format, hook, and language performs best",
        "Use data to decide what to list, film, discount, and show live"
    ]),
    ("Video Business Outlook", [
        "Short term: more exposure and faster trust for new stock",
        "Medium term: live cutdowns become repeatable traffic",
        "Long term: AI video operations can become an agency or SaaS product"
    ]),
    ("Video Tools Roadmap", [
        "Phase 1: scripts, shot lists, captions, calendars, and PPT narrative",
        "Phase 2: CapCut/Canva templates and upload workflow",
        "Phase 3: HeyGen, Runway, Kling, and platform API integrations"
    ]),
    ("Bilingual AI Customer Support", [
        "Safe auto-replies for condition, payment, delivery, proof, budget requests",
        "Escalate fake claims, refunds, chargebacks, threats, and high-risk discounts",
        "Store every risky conversation in the dispute record"
    ]),
    ("Community Growth Without Fake Reviews", [
        "Real KOC try-ons, VIP drops, polls, product previews, live warm-up",
        "No fake buyers, fake reviews, fake sold-out, or competitor attacks",
        "Multi-account content matrix with real positioning"
    ]),
    ("Risk, Legal, Anti-Counterfeit Protection", [
        "No fake, replica, 1:1, mirror quality, or logo-copy items",
        "Do not claim official authorisation unless documented",
        "UK and HK terms stay separate and require professional review"
    ]),
    ("90-Day UK/HK Roadmap", [
        "Days 1-30: proof database, listings, dashboard, first 30-80 items",
        "Days 31-60: content/live engine, CRM, VIP list, HK/UK market tests",
        "Days 61-90: weekly drops, analytics, first agency pilot"
    ]),
    ("Success Metrics", [
        "Daily: 20-50 content assets, 10-30 listings/reposts, real engagement",
        "Weekly: best platform, best category, ROI, refund and dispute rate",
        "90 days: repeatable sourcing to proof to listing to live to fulfilment SOP"
    ]),
    ("Next Build Steps", [
        "Build monorepo MVP and shared schema",
        "Implement proof, listing, content/live, support, risk, finance services",
        "Use the control center as the founder's daily operating screen"
    ]),
]


def content_types() -> str:
    overrides = "\n".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, len(slides) + 1)
    )
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
{overrides}
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''


def root_rels() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''


def presentation_xml() -> str:
    slide_ids = "\n".join(
        f'<p:sldId id="{255 + i}" r:id="rId{i}"/>' for i in range(1, len(slides) + 1)
    )
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{len(slides)+1}"/></p:sldMasterIdLst>
<p:sldIdLst>{slide_ids}</p:sldIdLst>
<p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
<p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>'''


def presentation_rels() -> str:
    rels = "\n".join(
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, len(slides) + 1)
    )
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
{rels}
<Relationship Id="rId{len(slides)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
<Relationship Id="rId{len(slides)+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>'''


def rect(shape_id: int, x: int, y: int, cx: int, cy: int, fill: str, line: str = "none", radius: bool = False) -> str:
    line_xml = "<a:noLine/>" if line == "none" else f'<a:ln w="12000"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>'
    geom = "roundRect" if radius else "rect"
    return f'''<p:sp>
<p:nvSpPr><p:cNvPr id="{shape_id}" name="Shape {shape_id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>{line_xml}</p:spPr>
</p:sp>'''


def text_box(
    shape_id: int,
    x: int,
    y: int,
    cx: int,
    cy: int,
    lines: list[str],
    font_size: int,
    bold: bool = False,
    color: str = "1E293B",
    align: str = "l",
    space_after: int = 90000
) -> str:
    paragraphs = []
    for line in lines:
        paragraphs.append(
            f'''<a:p><a:pPr algn="{align}"><a:spcAft><a:spcPts val="{space_after}"/></a:spcAft></a:pPr><a:r><a:rPr lang="en-US" sz="{font_size}" b="{1 if bold else 0}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill><a:latin typeface="Aptos"/></a:rPr><a:t>{escape(line)}</a:t></a:r><a:endParaRPr sz="{font_size}"/></a:p>'''
        )
    paragraph_xml = "".join(paragraphs)
    return f'''<p:sp>
<p:nvSpPr><p:cNvPr id="{shape_id}" name="TextBox {shape_id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
<p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>{paragraph_xml}</p:txBody>
</p:sp>'''


def section_name(index: int) -> str:
    if index <= 6:
        return "MARKET STRATEGY"
    if index <= 16:
        return "OPERATING SYSTEM"
    if index <= 32:
        return "VIDEO + LIVE ENGINE"
    if index <= 35:
        return "CUSTOMER + RISK"
    return "ROADMAP"


def cover_slide_xml() -> str:
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="111827"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
{rect(2, 0, 0, 12192000, 6858000, "111827")}
{rect(3, 8300000, 0, 3892000, 6858000, "0F766E")}
{rect(4, 760000, 870000, 1850000, 360000, "D6A84F", radius=True)}
{text_box(5, 900000, 930000, 1600000, 260000, ["UK + HONG KONG"], 1050, True, "111827", "ctr", 0)}
{text_box(6, 720000, 1530000, 6900000, 1850000, ["AI Luxury Resale OS"], 4400, True, "F8FAFC", "l", 0)}
{text_box(7, 760000, 3380000, 6500000, 850000, ["One founder. Full AI team. Dual-market resale, video, live commerce, proof, CRM, fulfilment, and risk operations."], 1700, False, "CBD5E1", "l", 0)}
{rect(8, 760000, 4850000, 1800000, 500000, "1F2937", "334155", True)}
{rect(9, 2760000, 4850000, 1800000, 500000, "1F2937", "334155", True)}
{rect(10, 4760000, 4850000, 2200000, 500000, "1F2937", "334155", True)}
{text_box(11, 850000, 4990000, 1600000, 220000, ["GBP / HKD"], 1050, True, "F8FAFC", "ctr", 0)}
{text_box(12, 2870000, 4990000, 1600000, 220000, ["AI VIDEO"], 1050, True, "F8FAFC", "ctr", 0)}
{text_box(13, 4900000, 4990000, 1900000, 220000, ["PROOF-FIRST"], 1050, True, "F8FAFC", "ctr", 0)}
{text_box(14, 760000, 6260000, 4200000, 250000, ["Professional operating deck | Generated from the monorepo"], 850, False, "94A3B8", "l", 0)}
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''


def slide_xml(index: int, title: str, bullets: list[str]) -> str:
    if index == 1:
        return cover_slide_xml()
    bullet_lines = [f"• {bullet}" for bullet in bullets]
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F4F1EA"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
{rect(2, 0, 0, 12192000, 260000, "111827")}
{rect(3, 0, 260000, 240000, 6598000, "0F766E")}
{rect(4, 780000, 1420000, 10680000, 3980000, "FFFFFF", "E5DED2", True)}
{rect(5, 780000, 660000, 1600000, 300000, "D6A84F", radius=True)}
{text_box(6, 930000, 720000, 1340000, 200000, [section_name(index)], 850, True, "111827", "ctr", 0)}
{text_box(7, 780000, 1010000, 10200000, 560000, [title], 2500, True, "111827", "l", 0)}
{text_box(8, 1100000, 1760000, 9900000, 3200000, bullet_lines, 1750, False, "263142", "l", 95000)}
{rect(9, 780000, 5720000, 2800000, 470000, "111827", "111827", True)}
{text_box(10, 930000, 5850000, 2500000, 210000, ["Founder view: action, risk, cashflow"], 850, True, "F8FAFC", "ctr", 0)}
{text_box(11, 8400000, 6420000, 3300000, 240000, [f"AI Luxury Resale OS | UK + HK | {index:02d}"], 850, False, "64748B", "r", 0)}
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''


MINIMAL_MASTER = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles/></p:sldMaster>'''

MINIMAL_LAYOUT = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'''

MINIMAL_THEME = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="AI Luxury Resale OS"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1E293B"/></a:dk2><a:lt2><a:srgbClr val="F7F8F5"/></a:lt2><a:accent1><a:srgbClr val="0F766E"/></a:accent1><a:accent2><a:srgbClr val="B45309"/></a:accent2><a:accent3><a:srgbClr val="334155"/></a:accent3><a:accent4><a:srgbClr val="7C3AED"/></a:accent4><a:accent5><a:srgbClr val="0369A1"/></a:accent5><a:accent6><a:srgbClr val="BE123C"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"/></a:themeElements></a:theme>'''


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
        pptx.writestr("docProps/core.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>AI Luxury Resale OS UK HK</dc:title><dc:creator>Codex</dc:creator></cp:coreProperties>''')
        pptx.writestr("docProps/app.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>''')
        for index, (title, bullets) in enumerate(slides, start=1):
            pptx.writestr(f"ppt/slides/slide{index}.xml", slide_xml(index, title, bullets))
            pptx.writestr(f"ppt/slides/_rels/slide{index}.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>''')
    print(f"Generated {OUT}")


if __name__ == "__main__":
    main()
