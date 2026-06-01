/**
 * task-factory.ts — converts agent outputs into executable tasks
 *
 * This is the "planner" layer: it decides WHAT to execute based on
 * agent results. Every task has a risk gate — critical tasks always
 * require human approval before running.
 */
import type {
  ExecutionTask,
  ExecutionRisk,
  ExecutorPlatform,
  AgentId,
  ListingTask,
  ContentTask,
  SourcingQueueItem,
  RiskAlert,
} from "./execution-types.js";

let _taskSeq = 0;
function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_taskSeq}`;
}

function task(
  sourceAgent: AgentId,
  market: string,
  risk: ExecutionRisk,
  summary: string,
  platform: ExecutorPlatform,
  payload: Record<string, unknown>,
  requiresApproval = false,
  approvalReason?: string
): ExecutionTask {
  return {
    id: makeId(platform),
    sourceAgent,
    market,
    risk,
    summary,
    platform,
    payload,
    requiresApproval,
    approvalReason,
    createdAt: new Date().toISOString(),
  };
}

// ── Listing tasks ──────────────────────────────────────────────────────────────

export function fromListingTask(
  listing: ListingTask,
  /** Shopify payload built by platform-connectors */
  shopifyPayload: Record<string, unknown>,
  /** eBay listing copy */
  ebayPayload: Record<string, unknown>
): ExecutionTask[] {
  const tasks: ExecutionTask[] = [];

  if (listing.priority !== "low") {
    // Shopify — medium risk for budget, high risk for luxury
    const risk: ExecutionRisk =
      listing.reason.includes("luxury") ? "high" : "medium";
    tasks.push(
      task(
        "listing",
        listing.product.market,
        risk,
        `[Shopify] Publish listing for ${listing.product.sku} (${listing.priority})`,
        "shopify",
        { listingTask: listing, shopifyPayload },
        risk === "high",
        risk === "high" ? "Luxury item listing — founder approval required" : undefined
      )
    );

    // eBay — medium risk
    tasks.push(
      task(
        "listing",
        listing.product.market,
        "medium",
        `[eBay] Publish listing for ${listing.product.sku} (${listing.priority})`,
        "ebay",
        { listingTask: listing, ebayPayload },
        false
      )
    );
  }

  return tasks;
}

// ── Content tasks ────────────────────────────────────────────────────────────────

// ── Content tasks ────────────────────────────────────────────────────────────────

export interface DiscordPostPayload {
  channelId: string;
  content: string;
  embeds?: unknown[];
  market: string;
}

export interface WhatsAppPayload {
  toGroup: string;
  message: string;
  imageUrl?: string;
}

export function fromContentTask(
  content: ContentTask,
  captionsByPlatform: Record<string, string[]>,
  discordChannels: Record<string, string>,
  market: string
): ExecutionTask[] {
  const tasks: ExecutionTask[] = [];
  const captionKey = `short_video:${market === "UK" ? "en-GB" : "zh-Hant-HK"}`;
  const captions = captionsByPlatform[captionKey] ?? Object.values(captionsByPlatform).flat();

  // Discord VIP channel post — auto for all content
  const discordChannelId = discordChannels[market];
  if (discordChannelId && captions.length > 0) {
    const body = captions
      .slice(0, 3)
      .map((c) => `📦 **${content.product.sku}**\n${c}`)
      .join("\n\n");

    tasks.push(
      task(
        "content",
        market,
        "low",
        `[Discord] Post content preview for ${content.product.sku} → #vip-${market.toLowerCase()}`,
        "discord",
        {
          channelId: discordChannelId,
          content: body,
          market,
        } satisfies DiscordPostPayload,
        false
      )
    );
  }

  // WhatsApp VIP broadcast — medium risk (mass message)
  tasks.push(
    task(
      "content",
      market,
      "medium",
      `[WhatsApp] VIP drop preview for ${content.product.sku} → ${market === "HK" ? "VIP 群組" : "VIP group"}`,
      "whatsapp",
      {
        toGroup: "",
        message: `🆕 新貨預覽 / New Drop\n\n` +
          `📦 SKU: ${content.product.sku}\n` +
          `${captions[0] ?? ""}`,
      } satisfies WhatsAppPayload,
      true,
      "WhatsApp broadcast to VIP group — founder confirmation required"
    )
  );

  return tasks;
}

// ── Sourcing tasks ─────────────────────────────────────────────────────────────

export function fromSourcingDecision(
  decision: SourcingQueueItem,
  market: string,
  leadUrl?: string
): ExecutionTask | null {
  if (decision.decision === "watch") {
    // Auto-watch: add to tracking list (mock for now)
    return task(
      "sourcing",
      market,
      "low",
      `[Track] Watch lead ${decision.leadId} — ${decision.leadTitle} (ROI ${decision.roiPercent}%)`,
      "discord",
      {
        channelId: "LEADS",
        content: `👁 Watch: ${decision.leadTitle}\nROI: ${decision.roiPercent}% — reasons: ${decision.reasons.join(" | ")}`,
        market,
        leadUrl,
      }
    );
  }

  if (decision.decision === "buy") {
    return task(
      "sourcing",
      market,
      "high",
      `[Buy] Purchase lead ${decision.leadId} — ${decision.leadTitle}\n` +
        `Est. profit: ${decision.estimatedProfit.currency} ${decision.estimatedProfit.amount}`,
      "discord",
      {
        channelId: "ESCALATION",
        content:
          `🚨 **BUY DECISION — REQUIRES APPROVAL**\n` +
          `Lead: ${decision.leadTitle}\n` +
          `Est. profit: ${decision.estimatedProfit.currency} ${decision.estimatedProfit.amount}\n` +
          `ROI: ${decision.roiPercent}%\n` +
          `Reasons: ${decision.reasons.join(" | ")}\n` +
          `Link: ${leadUrl ?? "N/A"}`,
        market,
      },
      true,
      "Buy decision — founder must approve before purchasing"
    );
  }

  return null; // reject: no execution needed
}

// ── Risk alert → escalation task ─────────────────────────────────────────────

export function fromRiskAlert(
  alert: RiskAlert
): ExecutionTask | null {
  if (alert.severity === "critical" || alert.severity === "high") {
    return task(
      alert.agentId as AgentId,
      "GLOBAL",
      alert.severity === "critical" ? "critical" : "high",
      `[ESCALATE] ${alert.message}`,
      "discord",
      {
        channelId: "ESCALATION",
        content: `🚨 **[${alert.severity.toUpperCase()}] ${alert.rule}**\n${alert.message}\n${alert.actionRequired ? `Action: ${alert.actionRequired}` : ""}`,
        productSku: alert.productSku,
        leadId: alert.leadId,
      },
      true,
      alert.actionRequired
    );
  }

  return null; // info/warning: logged but not escalated
}

// ── All tasks from a full run ─────────────────────────────────────────────────

export interface AgentOutputs {
  listingTasks: ListingTask[];
  contentTasks: ContentTask[];
  captionsByPlatform: Record<string, string[]>;
  sourcingItems: SourcingQueueItem[];
  riskAlerts: RiskAlert[];
}

export function buildExecutionQueue(
  outputs: AgentOutputs,
  opts: {
    shopifyPayloads: Map<string, Record<string, unknown>>;
    ebayPayloads: Map<string, Record<string, unknown>>;
    discordChannels: Record<string, string>;
  }
): ExecutionTask[] {
  const queue: ExecutionTask[] = [];

  for (const listing of outputs.listingTasks) {
    queue.push(
      ...fromListingTask(
        listing,
        opts.shopifyPayloads.get(listing.product.sku) ?? {},
        opts.ebayPayloads.get(listing.product.sku) ?? {}
      )
    );
  }

  for (const content of outputs.contentTasks) {
    queue.push(
      ...fromContentTask(
        content,
        outputs.captionsByPlatform,
        opts.discordChannels,
        content.product.sku.startsWith("UK") ? "UK" : "HK"
      )
    );
  }

  for (const sourcing of outputs.sourcingItems) {
    const market = sourcing.leadId.startsWith("lead-uk") ? "UK" : "HK";
    const t = fromSourcingDecision(sourcing, market);
    if (t) queue.push(t);
  }

  for (const alert of outputs.riskAlerts) {
    const t = fromRiskAlert(alert);
    if (t) queue.push(t);
  }

  return queue;
}
