/**
 * discord-executor.ts — Discord execution adapter
 *
 * Responsibilities:
 *  - Send rich embeds to VIP channels (product drops, new listings)
 *  - Send escalation alerts to a dedicated #alerts channel
 *  - Post live run summaries to a #daily-reports channel
 *
 * Auth: DISCORD_BOT_TOKEN (Bot auth — NOT webhook)
 * API: Discord REST API v10
 *
 * Channels are configured via env vars:
 *   DISCORD_VIP_CHANNEL_UK    — UK VIP product drop channel
 *   DISCORD_VIP_CHANNEL_HK    — HK VIP product drop channel
 *   DISCORD_ALERTS_CHANNEL    — Escalations & risk alerts
 *   DISCORD_REPORTS_CHANNEL   — Daily cycle reports
 */
import type { ExecutionTask, ExecutionResult, DiscordPostPayload } from "./execution-types.js";

interface DiscordConfig {
  botToken: string;
  vipChannels: Record<string, string>; // market → channelId
  alertsChannel: string;
  reportsChannel: string;
}

function loadConfig(): DiscordConfig {
  const botToken =
    process.env.DISCORD_BOT_TOKEN ??
    (typeof process !== "undefined" ? process.env["DISCORD_BOT_TOKEN"] : undefined) ??
    "";

  return {
    botToken,
    vipChannels: {
      UK: process.env["DISCORD_VIP_CHANNEL_UK"] ?? "",
      HK: process.env["DISCORD_VIP_CHANNEL_HK"] ?? "",
    },
    alertsChannel: process.env["DISCORD_ALERTS_CHANNEL"] ?? "",
    reportsChannel: process.env["DISCORD_REPORTS_CHANNEL"] ?? "",
  };
}

async function discordRequest(
  token: string,
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: unknown
): Promise<{ ok: boolean; id?: string; retry_after?: number }> {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      "User-Agent":
        "CLOTH-AutoWork/1.0 (luxury-resale Discord bot; contact: your-email@example.com)",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const data = (await res.json().catch(() => ({}))) as { retry_after?: number };
    throw new DiscordRateLimitError(data.retry_after ?? 5);
  }

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Discord API ${res.status}: ${err}`);
  }

  return res.json() as Promise<{ ok: boolean; id?: string }>;
}

class DiscordRateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super(`Discord rate limited — retry after ${retryAfter}s`);
    this.retryAfter = retryAfter;
    this.name = "DiscordRateLimitError";
  }
}

const DISCORD_EPOCH = 1420070400000n;
function snowflakeTime(id: string): Date {
  return new Date(Number((BigInt(id) >> 22n) + DISCORD_EPOCH));
}

// ── Channel message builder ───────────────────────────────────────────────────

interface PostPayload {
  channelId?: string;
  content?: string;
  market?: string;
}

function productEmbed(payload: PostPayload, taskId: string): unknown {
  return {
    title: `📦 New Listing — ${payload.market ?? ""}`,
    description: payload.content ?? "",
    color: payload.market === "UK" ? 0x9b59b6 : 0x27ae60,
    footer: { text: `CLOTH Auto Work · ${taskId}` },
    timestamp: new Date().toISOString(),
  };
}

function escalationEmbed(payload: PostPayload, taskId: string): unknown {
  return {
    title: `🚨 Escalation Alert`,
    description: payload.content ?? "",
    color: 0xe74c3c,
    footer: { text: `CLOTH Auto Work · ${taskId}` },
    timestamp: new Date().toISOString(),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface DiscordExecutorResult {
  channelId: string;
  messageId?: string;
  timestamp: Date;
}

export async function executeDiscordTask(
  task: ExecutionTask,
  config: DiscordConfig
): Promise<ExecutionResult> {
  const start = Date.now();
  const isMock = !config.botToken;

  if (isMock) {
    return {
      taskId: task.id,
      ok: true,
      mode: "mock",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `[MOCK] Would post to Discord: ${JSON.stringify(task.payload).slice(0, 200)}`,
    };
  }

  // Route to the right channel
  const p = task.payload as Partial<DiscordPostPayload>;
  const market = p.market ?? task.market;
  const channelId =
    p.channelId === "ESCALATION"
      ? config.alertsChannel
      : p.channelId === "LEADS"
      ? config.alertsChannel
      : config.vipChannels[market] ?? config.alertsChannel;

  if (!channelId) {
    return {
      taskId: task.id,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: `No Discord channel configured for market=${market} (set DISCORD_VIP_CHANNEL_${market} or DISCORD_ALERTS_CHANNEL env var)`,
    };
  }

  const isEscalation = task.risk === "critical" || task.risk === "high";
  const embed = isEscalation
    ? escalationEmbed(p, task.id)
    : productEmbed(p, task.id);

  try {
    // Handle rate limiting with backoff
    let attempts = 0;
    while (attempts < 3) {
      try {
        const result = await discordRequest(
          config.botToken,
          "POST",
          `/channels/${channelId}/messages`,
          {
            content: p.content ?? "",
            embeds: embed ? [embed] : [],
          }
        );
        return {
          taskId: task.id,
          ok: true,
          mode: "live",
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - start,
          platformMessage: `Posted message ${result.id} to channel ${channelId}`,
          platformRef: result.id,
        };
      } catch (err) {
        if (err instanceof DiscordRateLimitError) {
          await sleep(err.retryAfter * 1000);
          attempts++;
          continue;
        }
        throw err;
      }
    }

    return {
      taskId: task.id,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: "Max retry attempts (rate limit)",
    };
  } catch (err) {
    return {
      taskId: task.id,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Summary embed for daily reports ───────────────────────────────────────────

export interface ReportSummary {
  runId: string;
  market: string;
  tasksExecuted: number;
  succeeded: number;
  failed: number;
  escalations: number;
  nextActions: string[];
}

export async function postReportSummary(
  summary: ReportSummary,
  config: DiscordConfig
): Promise<ExecutionResult> {
  const start = Date.now();
  const isMock = !config.botToken;

  const color =
    summary.failed > 0 ? 0xe74c3c : summary.escalations > 0 ? 0xf39c12 : 0x27ae60;

  const nextActionsText =
    summary.nextActions.length > 0
      ? summary.nextActions.slice(0, 5).map((a) => `• ${a}`).join("\n")
      : "✅ No urgent actions";

  const embed = {
    title: `📋 Auto Work Report — ${summary.market}`,
    description: [
      `**Run ID:** \`${summary.runId}\``,
      `**Tasks:** ${summary.tasksExecuted} executed · ${summary.succeeded} ✅ · ${summary.failed} ❌`,
      `**Escalations:** ${summary.escalations}`,
      "",
      `**Next Actions**`,
      nextActionsText,
    ].join("\n"),
    color,
    footer: { text: "CLOTH Auto Work Agent" },
    timestamp: new Date().toISOString(),
  };

  if (isMock || !config.reportsChannel) {
    return {
      taskId: `report-${Date.now()}`,
      ok: true,
      mode: "mock",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `[MOCK] Would post report embed to #reports`,
    };
  }

  try {
    const result = await discordRequest(config.botToken, "POST", `/channels/${config.reportsChannel}/messages`, {
      embeds: [embed],
    });
    return {
      taskId: `report-${Date.now()}`,
      ok: true,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `Report posted to #reports channel`,
      platformRef: result.id,
    };
  } catch (err) {
    return {
      taskId: `report-${Date.now()}`,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export { loadConfig as loadDiscordConfig };
