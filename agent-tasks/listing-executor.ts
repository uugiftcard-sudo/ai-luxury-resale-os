/**
 * listing-executor.ts — eBay + Shopify listing execution
 *
 * Responsibilities:
 *  - Submit product listings to eBay (UK)
 *  - Submit product listings to Shopify
 *  - Both use the ConnectorResult from platform-connectors
 *
 * eBay Auth: OAuth refresh token (eBay makes you refresh frequently)
 *   EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_REFRESH_TOKEN
 *
 * Shopify Auth: Admin API access token
 *   SHOPIFY_ADMIN_TOKEN + SHOPIFY_UK_STORE_DOMAIN / SHOPIFY_HK_STORE_DOMAIN
 *
 * In mock mode, payloads are validated but not submitted.
 * Each function returns the full ConnectorResult + execution metadata.
 */
import type { ExecutionTask, ExecutionResult } from "./execution-types.js";
import type { ListingTask } from "./types.js";

interface ListingExecutorResult extends ExecutionResult {
  connectorPayload?: Record<string, unknown>;
  platformListingId?: string;
}

// ── eBay ─────────────────────────────────────────────────────────────────────

interface EbayConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  marketplaceId: string; // eBay UK = "EBAY_GB"
}

export function loadEbayConfig(): EbayConfig {
  return {
    clientId: process.env["EBAY_CLIENT_ID"] ?? "",
    clientSecret: process.env["EBAY_CLIENT_SECRET"] ?? "",
    refreshToken: process.env["EBAY_REFRESH_TOKEN"] ?? "",
    marketplaceId: "EBAY_GB",
  };
}

async function getEbayAccessToken(config: EbayConfig): Promise<string> {
  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  const res = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: config.refreshToken,
        scope:
          "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eBay token refresh failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

interface EbayListingPayload {
  sku: string;
  title: string;
  description: string;
  price: { value: string; currency: string };
  categoryId: string;
  condition: string;
  conditionDescription?: string;
  imageUrls: string[];
  handlingTime: string;
  shippingOptions: unknown[];
}

export async function executeEbayListing(
  task: ExecutionTask,
  config: EbayConfig
): Promise<ListingExecutorResult> {
  const start = Date.now();
  const isMock = !config.clientId;

  const payload = task.payload as {
    listingTask: ListingTask;
    ebayPayload: Record<string, unknown>;
  };

  if (isMock) {
    return {
      taskId: task.id,
      ok: true,
      mode: "mock",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `[MOCK] Would list on eBay UK:\nSKU: ${payload.listingTask.product.sku}\nPlatforms: ${payload.listingTask.platforms.join(", ")}`,
      connectorPayload: payload.ebayPayload,
    };
  }

  try {
    const token = await getEbayAccessToken(config);
    const body = payload.ebayPayload as EbayListingPayload;

    const res = await fetch(
      "https://api.ebay.com/sell/inventory/v1/offer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return {
        taskId: task.id,
        ok: false,
        mode: "live",
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        error: `eBay API ${res.status}: ${err}`,
        connectorPayload: payload.ebayPayload,
      };
    }

    const data = (await res.json()) as { offerId?: string; listingId?: string };
    return {
      taskId: task.id,
      ok: true,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `eBay offer created: ${data.offerId ?? data.listingId ?? "unknown"}`,
      platformRef: data.offerId ?? data.listingId,
      connectorPayload: payload.ebayPayload,
    };
  } catch (err) {
    return {
      taskId: task.id,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
      connectorPayload: payload.ebayPayload,
    };
  }
}

// ── Shopify ──────────────────────────────────────────────────────────────────

interface ShopifyConfig {
  adminToken: string;
  storeDomain: string;
}

function loadShopifyConfig(productMarket: string): ShopifyConfig {
  const domainKey =
    productMarket === "UK"
      ? "SHOPIFY_UK_STORE_DOMAIN"
      : "SHOPIFY_HK_STORE_DOMAIN";
  return {
    adminToken: process.env["SHOPIFY_ADMIN_TOKEN"] ?? "",
    storeDomain: process.env[domainKey] ?? "",
  };
}

export async function executeShopifyListing(
  task: ExecutionTask,
  _config: ShopifyConfig
): Promise<ListingExecutorResult> {
  const start = Date.now();
  // Use per-market config
  const payload = task.payload as { listingTask: ListingTask; shopifyPayload: Record<string, unknown> };
  const config = loadShopifyConfig(payload.listingTask.product.market);
  const isMock = !config.adminToken || !config.storeDomain;

  if (isMock) {
    return {
      taskId: task.id,
      ok: true,
      mode: "mock",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `[MOCK] Would publish to Shopify ${payload.listingTask.product.market} (${config.storeDomain || "no domain set"}):\nSKU: ${payload.listingTask.product.sku}`,
      connectorPayload: payload.shopifyPayload,
    };
  }

  const body = payload.shopifyPayload as Record<string, unknown>;

  try {
    const res = await fetch(
      `https://${config.storeDomain}/admin/api/2024-01/products.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": config.adminToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: body }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return {
        taskId: task.id,
        ok: false,
        mode: "live",
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        error: `Shopify API ${res.status}: ${err}`,
        connectorPayload: payload.shopifyPayload,
      };
    }

    const data = (await res.json()) as { product?: { id?: string; title?: string } };
    const productId = data.product?.id?.toString() ?? "unknown";

    return {
      taskId: task.id,
      ok: true,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      platformMessage: `Shopify product created: ${data.product?.title} (ID: ${productId})`,
      platformRef: productId,
      connectorPayload: payload.shopifyPayload,
    };
  } catch (err) {
    return {
      taskId: task.id,
      ok: false,
      mode: "live",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
      connectorPayload: payload.shopifyPayload,
    };
  }
}
