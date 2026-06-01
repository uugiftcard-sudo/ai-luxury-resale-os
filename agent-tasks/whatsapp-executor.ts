/**
 * whatsapp-executor.ts — WhatsApp execution adapter
 *
 * Responsibilities:
 *  - Send VIP product preview messages to WhatsApp group(s)
 *  - Support both WhatsApp Business API and WhatsApp Cloud API
 *
 * Auth: WhatsApp Business API access token + Phone Number ID
 * Env vars:
 *   WHATSAPP_ACCESS_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_WABA_ID          (WhatsApp Business Account ID)
 *   WHATSAPP_VIP_GROUP_UK     (group JID or recipient number)
 *   WHATSAPP_VIP_GROUP_HK
 *
 * Note: WhatsApp Cloud API does NOT support sending to group JIDs directly
 * without the group admin approving the app. For most operations, we'll
 * send to the registered VIP customer phone list instead.
 *
 * In mock mode, messages are logged to console only.
 */
import type { ExecutionTask, ExecutionResult } from "./execution-types.js";
import type { WhatsAppPayload } from "./task-factory.js";

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  vipGroups: Record<string, string>; // market → recipient number
}

function loadConfig(): WhatsAppConfig {
  return {
    accessToken: process.env["WHATSAPP_ACCESS_TOKEN"] ?? "",
    phoneNumberId: process.env["WHATSAPP_PHONE_NUMBER_ID"] ?? "",
    wabaId: process.env["WHATSAPP_WABA_ID"] ?? "",
    vipGroups: {
      UK: process.env["WHATSAPP_VIP_GROUP_UK"] ?? "",
      HK: process.env["WHATSAPP_VIP_GROUP_HK"] ?? "",
    },
  };
}

async function whatsappRequest(
  config: WhatsAppConfig,
  body: Record<string, unknown>
): Promise<{ messages?: unknown[]; errors?: unknown[] }> {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        messaging_product: "whatsapp",
      }),
    }
  );

  const data = await res.json() as { messages?: unknown[]; errors?: unknown[]; error?: string };
  if (!res.ok || data.error) {
    throw new Error(
      `WhatsApp API ${res.status}: ${data.error ?? JSON.stringify(data.errors ?? data)}`
    );
  }
  return data;
}

function buildTextMessage(to: string, body: string): Record<string, unknown> {
  return {
    to,
    type: "text",
    text: { body },
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function executeWhatsAppTask(
  task: ExecutionTask,
  config: WhatsAppConfig
): Promise<ExecutionResult> {
  const start = Date.now();
  const isMock = !config.accessToken;

  const payload = task.payload as Partial<WhatsAppPayload>;
  const market = task.market;
  const recipient =
    payload.toGroup ?? config.vipGroups[market] ?? "";

  if (!recipient) {
    return {
      taskId: task.id,
      ok: false,
      mode: isMock ? "mock" : "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: `No WhatsApp recipient configured for market=${market}. Set WHATSAPP_VIP_GROUP_${market} env var.`,
    };
  }

  const messageBody = payload.message ?? task.summary;
  const templateName = "admin_broadcast"; // Must be pre-approved template in WhatsApp Business

  if (isMock) {
    return {
      taskId: task.id,
      ok: true,
      mode: "mock",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `[MOCK] Would send WhatsApp to ${recipient}:\n${messageBody.slice(0, 160)}…`,
    };
  }

  try {
    // Try template message (requires pre-approval) first
    const result = await whatsappRequest(config, {
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: market === "HK" ? "zh_HK" : "en_GB" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: messageBody.slice(0, 200) }],
          },
        ],
      },
    });

    return {
      taskId: task.id,
      ok: true,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `WhatsApp template sent to ${recipient} via ${templateName}`,
      platformRef: (result.messages as unknown[])?.[0]
        ? String((result.messages as unknown[])[0])
        : undefined,
    };
  } catch (err) {
    // Fallback: send as regular text (only works if recipient has messaged us first)
    if (err instanceof Error && err.message.includes("template")) {
      try {
        const fallbackResult = await whatsappRequest(config, buildTextMessage(recipient, messageBody));
        return {
          taskId: task.id,
          ok: true,
          mode: "live",
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - start,
          platformMessage: `WhatsApp text fallback sent to ${recipient}`,
          platformRef: (fallbackResult.messages as unknown[])?.[0]
            ? String((fallbackResult.messages as unknown[])[0])
            : undefined,
        };
      } catch {
        /* fall through to error */
      }
    }

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

export { loadConfig as loadWhatsAppConfig };
