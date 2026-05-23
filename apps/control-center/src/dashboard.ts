import * as readline from "readline";
import { agentsForMarket, agentTeam } from "@luxury/agents";
import {
  products, proofPacks, orders, leads, customers, liveSessions,
  seedAll, dataSummary, type Product, type ProofPack, type OrderRecord, type SourcingLead, type CustomerProfile,
  type LiveSession
} from "@luxury/db";
import { auditProofPack, calculateProofScore } from "@luxury/product-proof";
import { generateListings } from "@luxury/listing-crosspost";
import { generateContentPack } from "@luxury/content-live";
import { generateProductVideoPack, dailyVideoCalendar } from "@luxury/video-factory";
import { scoreSourcingLead } from "@luxury/sourcing-engine";
import { respondToCustomer, createCRMTask } from "@luxury/customer-support-crm";
import { buildFulfilmentPlan } from "@luxury/order-fulfillment";
import { buildLiveRunOfShow } from "@luxury/live-ops";
import { buildControlCenterSnapshot } from "./index.js";
import {
  sampleProducts, sampleProofPacks, sampleSourcingLeads,
  sampleOrders, sampleLiveSessions, sampleCustomers
} from "../../../scripts/sample-data.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// ─── colours ────────────────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const MAGENTA= "\x1b[35m";
const RED    = "\x1b[31m";
const BLUE   = "\x1b[34m";
const BG_BLK = "\x1b[40m";
const CLEAR  = "\x1b[2J\x1b[H";

function label(col: string, text: string) { return `${col}${text}${RESET}`; }
function hdr(text: string) { return `${CYAN}${BOLD}${text}${RESET}`; }
function ok(text: string)   { return `${GREEN}${text}${RESET}`; }
function warn(text: string) { return `${YELLOW}${text}${RESET}`; }
function err(text: string)  { return `${RED}${text}${RESET}`; }
function dim(text: string)  { return `${DIM}${text}${RESET}`; }
function cyan(text: string) { return `${CYAN}${text}${RESET}`; }

// ─── divider ────────────────────────────────────────────────────────────────

function divider(char = "─", width = 72) {
  console.log(label(CYAN, char.repeat(width)));
}

function spacer() { console.log(); }

// ─── ask ────────────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  return new Promise((res) => rl.question(question, res));
}

// ─── seed ──────────────────────────────────────────────────────────────────

function ensureSeeded(): void {
  if (products.count() === 0) {
    seedAll(sampleProducts, sampleProofPacks, sampleSourcingLeads, sampleOrders);
    customers.findAll().forEach(() => {}); // touch collection
    console.log(label(GREEN, `✓ Seeded ${sampleProducts.length} products, ${sampleProofPacks.length} proofs, ${sampleSourcingLeads.length} leads, ${sampleOrders.length} orders`));
  }
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

function buildProductStats(market: "UK" | "HK") {
  const allProducts = products.findAll().filter((p) => p.market === market);
  const allProofs = proofPacks.findAll().filter((p) => p.market === market);
  const proofBySku = new Map(allProofs.map((p) => [p.sku, p]));
  const allOrders = orders.findAll().filter((o) => o.market === market);
  const allLeads = leads.findAll().filter((l) => l.market === market);
  const allCustomers = customers.findAll().filter((c) => c.market === market);
  const allSessions = liveSessions.findAll().filter((s) => s.market === market);

  const luxury = allProducts.filter((p) => p.brandStream === "luxury_resale");
  const budget = allProducts.filter((p) => p.brandStream === "budget_fashion");

  const proofComplete = allProducts.filter((p) => {
    const proof = proofBySku.get(p.sku);
    return proof ? auditProofPack(p, proof).complete : false;
  }).length;

  const allListings = allProducts.flatMap((p) =>
    generateListings(p, proofBySku.get(p.sku))
  );
  const listingReady = allListings.filter((l) => l.status === "ready").length;

  const actionQueue: string[] = [];
  for (const p of allProducts) {
    const proof = proofBySku.get(p.sku);
    if (!proof) actionQueue.push(`  ${p.sku}: create proof pack`);
    else {
      const audit = auditProofPack(p, proof);
      if (!audit.complete) actionQueue.push(`  ${p.sku}: finish proof pack (${audit.missing.join(", ")})`);
    }
  }

  return {
    allProducts, allProofs, proofBySku,
    luxury, budget, proofComplete, listingReady, allListings,
    allOrders, allLeads, allCustomers, allSessions,
    actionQueue
  };
}

function renderDashboard(market: "UK" | "HK") {
  console.log(CLEAR);
  const flag = market === "UK" ? "🇬🇧 UK" : "🇭🇰 HK";
  console.log(hdr(`\n  CLOTH Control Center  |  Market: ${flag}  |  ${new Date().toLocaleString()}`));
  divider("═");

  const stats = buildProductStats(market);
  const snapshot = buildControlCenterSnapshot(market, stats.allProducts, stats.allProofs);

  // ── inventory ──
  console.log(hdr("  INVENTORY"));
  divider();
  const items = [
    ["Total Products", `${stats.allProducts.length}`, market === "UK" ? "UK" : "HK"],
    ["  Luxury Resale", `${stats.luxury.length}`, "strong proof needed"],
    ["  Budget Fashion", `${stats.budget.length}`, "no proof pack required"],
    ["Proof-Ready", `${stats.proofComplete}/${stats.allProducts.length}`, stats.proofComplete === stats.allProducts.length ? "all done" : "missing some"],
    ["Listing-Ready", `${stats.listingReady}/${stats.allListings.length}`, "ready to publish"],
  ];
  for (const [label_, value, note] of items) {
    const val = label(value.startsWith("0/") || value.startsWith("1/") ? YELLOW : GREEN, value.padEnd(6));
    console.log(`  ${label_}  ${val}  ${dim(note)}`);
  }

  spacer();

  // ── orders ──
  console.log(hdr("  ORDERS & FULFILMENT"));
  divider();
  const byStatus: Record<string, number> = {};
  for (const o of stats.allOrders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  if (Object.keys(byStatus).length === 0) {
    console.log(dim("  No orders yet"));
  } else {
    for (const [status, count] of Object.entries(byStatus)) {
      const col = status === "paid" ? GREEN : status === "disputed" ? RED : YELLOW;
      console.log(`  ${status.padEnd(20)} ${label(col, String(count).padStart(3))}`);
    }
  }

  spacer();

  // ── pipeline ──
  console.log(hdr("  PIPELINE"));
  divider();
  const stages = [
    ["Sourcing Leads", stats.allLeads.length],
    ["Customers", stats.allCustomers.length],
    ["Live Sessions", stats.allSessions.length],
    ["Content Assets", stats.allProducts.flatMap((p) => generateContentPack(p)).length],
    ["Video Assets", stats.allProducts.flatMap((p) => generateProductVideoPack(p, stats.proofBySku.get(p.sku))).length],
  ];
  for (const [name, count] of stages) {
    console.log(`  ${String(name).padEnd(22)} ${label(GREEN, String(count).padStart(4))}`);
  }

  spacer();

  // ── action queue ──
  console.log(hdr("  ACTION QUEUE"));
  divider();
  if (stats.actionQueue.length === 0) {
    console.log(ok("  ✓ All clear — no actions needed"));
  } else {
    stats.actionQueue.forEach((item) => console.log(warn(`  ⚠ ${item}`)));
  }

  spacer();

  // ── active agents ──
  console.log(hdr("  ACTIVE AGENTS"));
  divider();
  const marketAgents = agentsForMarket(market);
  for (let i = 0; i < marketAgents.length; i++) {
    const a = marketAgents[i];
    const dept = label(MAGENTA, `[${a.department}]`);
    console.log(`  ${dim(String(i + 1).padStart(2))}  ${dept}  ${a.title}`);
  }

  spacer();
  divider();
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function cmdListProducts(market: "UK" | "HK") {
  const all = products.findAll().filter((p) => p.market === market);
  if (!all.length) { console.log(dim("  No products.")); return; }
  for (const p of all) {
    const proof = proofPacks.findBySku(p.sku);
    const score = calculateProofScore(p, proof);
    const scoreColor = score.grade === "strong" ? GREEN : score.grade === "medium" ? YELLOW : RED;
    const statusColor = p.status === "listed" ? GREEN : p.status === "sold" ? CYAN : YELLOW;
    console.log(`\n  ${label(BOLD, p.sku)}  ${label(CYAN, p.brandStream)}  ${label(statusColor, p.status)}`);
    console.log(`  ${p.title}`);
    console.log(`  Cost: ${p.cost.amount} ${p.cost.currency}  →  Target: ${p.targetPrice.amount} ${p.targetPrice.currency}`);
    console.log(`  Condition: ${p.conditionGrade}  ${p.conditionNotes}`);
    console.log(`  Proof: ${label(scoreColor, `${score.score}/100  [${score.grade}]`)}`);
    console.log(`  ${dim(`  Platforms: ${p.platforms.join(", ")}`)}`);
  }
}

async function cmdScoreLead(market: "UK" | "HK") {
  const marketLeads = leads.findAll().filter((l) => l.market === market);
  if (!marketLeads.length) { console.log(dim("  No sourcing leads in storage. Using sample leads...")); }
  const allLeads = marketLeads.length ? marketLeads : sampleSourcingLeads.filter((l: SourcingLead) => l.market === market);
  for (const lead of allLeads) {
    const result = scoreSourcingLead(lead);
    const decColor = result.decision === "buy" ? GREEN : result.decision === "watch" ? YELLOW : RED;
    console.log(`\n  ${label(BOLD, lead.id)}`);
    console.log(`  ${lead.title}`);
    console.log(`  Ask: ${lead.askingPrice.amount} ${lead.askingPrice.currency}  →  Est. resale: ${lead.estimatedResalePrice.amount} ${lead.estimatedResalePrice.currency}`);
    console.log(`  ROI: ${label(GREEN, `${result.roiPercent}%`)}  Decision: ${label(decColor, result.decision.toUpperCase())}`);
    if (result.reasons.length) console.log(`  Reasons: ${result.reasons.join("  ")}`);
    if (result.requiredChecks.length) console.log(`  ${warn(`Checks: ${result.requiredChecks.join("  ")}`)}`);
  }
}

async function cmdGenerateListings(market: "UK" | "HK") {
  const all = products.findAll().filter((p) => p.market === market);
  if (!all.length) { console.log(dim("  No products.")); return; }
  const chosen = all[0];
  const proof = proofPacks.findBySku(chosen.sku);
  const listings = generateListings(chosen, proof);
  console.log(hdr(`\n  Listings for ${chosen.sku} — ${chosen.title}`));
  for (const l of listings) {
    const w = l.warnings.length ? `  ${warn(`WARNINGS: ${l.warnings.join(", ")}`)}` : ok("  ✓ No warnings");
    console.log(`\n  [${l.platform}]  status: ${label(l.status === "ready" ? GREEN : YELLOW, l.status)}`);
    console.log(`  ${label(CYAN, l.title)}`);
    console.log(w);
    console.log(dim(`  ${l.description.slice(0, 120)}...`));
  }
}

async function cmdGenerateVideos(market: "UK" | "HK") {
  const all = products.findAll().filter((p) => p.market === market);
  if (!all.length) { console.log(dim("  No products.")); return; }
  const chosen = all[0];
  const proof = proofPacks.findBySku(chosen.sku);
  const videos = generateProductVideoPack(chosen, proof);
  console.log(hdr(`\n  Video Pack for ${chosen.sku} — ${chosen.title}`));
  console.log(label(CYAN, `  ${videos.length} video assets generated`));
  for (const v of videos) {
    console.log(`\n  [${label(MAGENTA, v.format)}]  ${label(CYAN, v.platformVersion)}`);
    console.log(`  Hook:  ${label(BOLD, v.hook)}`);
    console.log(`  Script: ${v.script.slice(0, 100)}...`);
    console.log(`  CTA:    ${v.callToAction}`);
    console.log(`  Tags:   ${dim(v.hashtags.join(" "))}`);
    if (v.complianceNotes.length) console.log(`  ${warn(`Compliance: ${v.complianceNotes.join(", ")}`)}`);
  }
}

async function cmdSimulateCustomer(market: "UK" | "HK") {
  const all = products.findAll().filter((p) => p.market === market);
  if (!all.length) { console.log(dim("  No products to simulate against.")); return; }
  const product = all[0];
  const proof = proofPacks.findBySku(product.sku);

  const intents: Array<{ label: string; intent: Parameters<typeof respondToCustomer>[0]["intent"] }> = [
    { label: "How much is it? / Shipping?", intent: "shipping" },
    { label: "Can I pay by FPS/PayMe?", intent: "payment" },
    { label: "Is this real / authentic?", intent: "fake_claim" },
    { label: "Can I return it?", intent: "return" },
    { label: "Do you have budget fashion?", intent: "budget_fashion_request" },
    { label: "Can you give me a discount?", intent: "discount" },
  ];

  console.log(hdr(`\n  Customer Interaction Simulator — ${market} Market`));
  console.log(dim(`  Product: ${product.sku} — ${product.title}\n`));
  for (const { label: desc, intent } of intents) {
    const reply = respondToCustomer({ market, language: product.language, channel: market === "HK" ? "carousell_hk" : "ebay_uk", customerId: "sim-customer", message: desc, intent }, product, proof);
    const escColor = reply.escalate ? RED : GREEN;
    console.log(`  ${label(BOLD, intent)} — ${desc}`);
    console.log(`  ${dim("Reply:")} ${reply.reply}`);
    console.log(`  ${label(escColor, reply.escalate ? "⚠ ESCALATE" : "✓ AUTO-REPLY OK")}`);
    if (reply.escalationReason) console.log(`  ${warn("Reason: " + reply.escalationReason)}`);
    console.log();
  }
}

async function cmdFulfilment(market: "UK" | "HK") {
  const allOrders = orders.findAll().filter((o) => o.market === market);
  if (!allOrders.length) { console.log(dim("  No orders.")); return; }
  for (const order of allOrders) {
    const proof = proofPacks.findBySku(order.sku);
    const plan = buildFulfilmentPlan(order, proof);
    console.log(hdr(`\n  Fulfilment Plan — ${order.orderId}  [${order.status}]`));
    console.log(dim(`  SKU: ${order.sku}  |  Platform: ${order.platform}  |  Method: ${order.fulfilmentMethod}`));
    console.log(hdr("\n  Steps:"));
    plan.steps.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
    if (plan.missingEvidence.length) {
      console.log(warn(`\n  Missing Evidence: ${plan.missingEvidence.join(", ")}`));
    }
    if (plan.riskWarnings.length) {
      plan.riskWarnings.forEach((w) => console.log(err(`  Risk: ${w}`)));
    }
    console.log(dim(`\n  Customer message: ${plan.customerMessage}`));
  }
}

async function cmdLiveSession(market: "UK" | "HK") {
  const allSessions = liveSessions.findAll().filter((s) => s.market === market);
  const all = sampleLiveSessions.filter((s: LiveSession) => s.market === market);
  const session = (allSessions.length ? allSessions[0] : all[0])!;
  if (!session) { console.log(dim("  No live session.")); return; }
  const sessionProducts = products.findAll().filter((p) => session.productSkus.includes(p.sku));
  const ros = buildLiveRunOfShow(session, sessionProducts);
  console.log(hdr(`\n  Live Run of Show — ${session.sessionId}`));
  console.log(dim(`  Market: ${market}  |  Phase: ${session.phase}  |  Products: ${session.productSkus.join(", ")}\n`));
  console.log(hdr("  Before Live:"));
  ros.beforeLive.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log(hdr("\n  During Live:"));
  ros.duringLive.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log(hdr("\n  After Live:"));
  ros.afterLive.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log(hdr("\n  Escalation Rules:"));
  ros.escalationRules.forEach((r) => console.log(err(`  • ${r}`)));
}

async function cmdDailySchedule(market: "UK" | "HK") {
  const tasks = dailyVideoCalendar(market);
  console.log(hdr(`\n  Daily Video Schedule — ${market}`));
  const slots = [...new Set(tasks.map((t) => t.slot))];
  for (const slot of slots) {
    console.log(label(BOLD, `\n  ${slot.toUpperCase()}`));
    divider("·");
    tasks.filter((t) => t.slot === slot).forEach((t) => {
      console.log(`  ${dim("→")} ${t.task}  ${label(GREEN, `×${t.targetCount}`)}`);
    });
  }
}

async function cmdAddProduct(market: "UK" | "HK") {
  console.log(label(CYAN, "\n  Add New Product (interactive)\n"));
  const currency = market === "UK" ? "GBP" : "HKD";
  const nextNum = products.findAll().filter((p) => p.market === market).length + 1;
  const prefix = market === "UK" ? "UK" : "HK";
  const streamAns = await ask(`  Brand stream? [luxury/budget] (default: luxury): `);
  const brandStream = (streamAns.trim() || "luxury") === "budget" ? "budget_fashion" : "luxury_resale";
  const title = await ask(`  Product title: `);
  const brand = await ask(`  Brand (optional, Enter to skip): `);
  const category = await ask(`  Category (e.g. bag, jacket): `);
  const size = await ask(`  Size (optional): `);
  const grade = await ask(`  Condition grade [A/B/C] (default: B): `) || "B";
  const notes = await ask(`  Condition notes: `);
  const costStr = await ask(`  Cost amount (${currency}): `);
  const costAmount = parseFloat(costStr) || 0;
  const targetStr = await ask(`  Target sell price (${currency}): `);
  const targetAmount = parseFloat(targetStr) || 0;

  const sku = `${prefix}-${brandStream === "luxury_resale" ? "LUX" : "BUD"}-${String(nextNum).padStart(3, "0")}`;
  const product: Product = {
    sku, market, brandStream,
    currency: currency as Product["currency"],
    language: market === "UK" ? "en-GB" : "zh-Hant-HK",
    title: title.trim(),
    brand: brand.trim() || undefined,
    category: category.trim() || "general",
    size: size.trim() || undefined,
    conditionGrade: grade.trim() as Product["conditionGrade"],
    conditionNotes: notes.trim(),
    cost: { amount: costAmount, currency: currency as Product["currency"] },
    targetPrice: { amount: targetAmount, currency: currency as Product["currency"] },
    status: "draft",
    platforms: market === "UK" ? ["shopify_uk", "tiktok_shop_uk", "ebay_uk"] : ["carousell_hk", "shopify_hk"],
    riskFlags: brandStream === "luxury_resale" ? ["designer_brand"] : [],
  };

  products.upsert(product);
  console.log(ok(`\n  ✓ Product saved: ${sku}`));
  console.log(`  ${JSON.stringify(product, null, 2)}`);
}

// ─── Main menu loop ──────────────────────────────────────────────────────────

async function mainLoop() {
  ensureSeeded();
  let market: "UK" | "HK" = "UK";

  while (true) {
    renderDashboard(market);
    divider();
    console.log(hdr("  COMMANDS"));
    divider();
    const cmds = [
      ["1", "Switch to UK", ""],
      ["2", "Switch to HK", ""],
      ["3", "List Products", ""],
      ["4", "Score Sourcing Leads", ""],
      ["5", "Generate Listings", ""],
      ["6", "Generate Video Pack", ""],
      ["7", "Simulate Customer Interactions", ""],
      ["8", "Fulfilment Plans", ""],
      ["9", "Live Session Run-of-Show", ""],
      ["A", "Daily Video Schedule", ""],
      ["P", "Add New Product", ""],
      ["R", "Refresh / Re-seed data", ""],
      ["Q", "Quit", ""],
    ];
    for (const [key, desc] of cmds) {
      console.log(`  ${label(CYAN, key.padEnd(3))} ${desc}`);
    }
    spacer();
    const input = await ask(label(BOLD, "  Command> "));
    const cmd = input.trim().toLowerCase();

    if (cmd === "q" || cmd === "quit" || cmd === "exit") break;

    else if (cmd === "1") { market = "UK"; continue; }
    else if (cmd === "2") { market = "HK"; continue; }
    else if (cmd === "3") { await cmdListProducts(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "4") { await cmdScoreLead(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "5") { await cmdGenerateListings(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "6") { await cmdGenerateVideos(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "7") { await cmdSimulateCustomer(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "8") { await cmdFulfilment(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "9") { await cmdLiveSession(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "a") { await cmdDailySchedule(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "p") { await cmdAddProduct(market); await ask(dim("\n  Press Enter to continue...")); }
    else if (cmd === "r") {
      seedAll(sampleProducts, sampleProofPacks, sampleSourcingLeads, sampleOrders);
      console.log(ok("\n  ✓ Data re-seeded."));
      await ask(dim("  Press Enter to continue..."));
    }
    else { continue; }
  }

  rl.close();
  console.log(label(CYAN, "\n  CLOTH Control Center — Goodbye!\n"));
}

mainLoop().catch((e) => { console.error(err(`\n  Error: ${e.message}`)); process.exit(1); });
