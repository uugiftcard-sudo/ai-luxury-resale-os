/**
 * env.ts — Typed environment configuration + startup validation
 *
 * Validates all required platform tokens on module load and prints
 * clear warnings for any that are missing. Does NOT block startup —
 * the system runs in mock mode when tokens are absent.
 *
 * Usage:
 *   import { env, shopifyConfig, tiktokConfig, ... } from "@luxury/db";
 */

import type { Market } from "./index.js";

// ── Raw env access ─────────────────────────────────────────────────────────

function req(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

function opt(key: string): string | undefined {
  return process.env[key];
}

function isSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

// ── Shopify ─────────────────────────────────────────────────────────────────

export interface ShopifyStoreConfig {
  storeDomain: string;
  adminToken: string;
  apiVersion: string;
  /** Whether this store's connector is real_ready or mock */
  mode: "real_ready" | "mock";
  missingVars: string[];
}

export interface ShopifyConfig {
  uk: ShopifyStoreConfig;
  hk: ShopifyStoreConfig;
  fallback: { storeDomain: string; adminToken: string };
}

function buildShopifyStoreConfig(
  market: "UK" | "HK",
  domainKey: string,
  tokenKey: string,
  versionKey: string
): ShopifyStoreConfig {
  const storeDomain = req(domainKey);
  const adminToken = req(tokenKey);
  const apiVersion = req(versionKey, "2024-01");
  const missingVars: string[] = [];

  if (!storeDomain) missingVars.push(domainKey);
  if (!adminToken) missingVars.push(tokenKey);

  const mode: "real_ready" | "mock" =
    storeDomain && adminToken ? "real_ready" : "mock";

  return { storeDomain, adminToken, apiVersion, mode, missingVars };
}

export const shopifyConfig: ShopifyConfig = {
  uk: buildShopifyStoreConfig(
    "UK",
    "SHOPIFY_UK_STORE_DOMAIN",
    "SHOPIFY_UK_ADMIN_TOKEN",
    "SHOPIFY_UK_API_VERSION"
  ),
  hk: buildShopifyStoreConfig(
    "HK",
    "SHOPIFY_HK_STORE_DOMAIN",
    "SHOPIFY_HK_ADMIN_TOKEN",
    "SHOPIFY_HK_API_VERSION"
  ),
  fallback: {
    storeDomain: req("SHOPIFY_STORE_DOMAIN"),
    adminToken: req("SHOPIFY_ADMIN_TOKEN"),
  },
};

/** Resolve the active Shopify config for a given market. */
export function shopifyConfigFor(market: Market): ShopifyStoreConfig {
  if (market === "UK") return shopifyConfig.uk;
  if (market === "HK") return shopifyConfig.hk;
  return {
    storeDomain: shopifyConfig.fallback.storeDomain,
    adminToken: shopifyConfig.fallback.adminToken,
    apiVersion: "2024-01",
    mode:
      shopifyConfig.fallback.storeDomain && shopifyConfig.fallback.adminToken
        ? "real_ready"
        : "mock",
    missingVars: [],
  };
}

// ── TikTok Shop ──────────────────────────────────────────────────────────────

export interface TikTokConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  advertiserId: string;
  eventsApiToken: string;
  mode: "real_ready" | "mock";
  missingVars: string[];
}

const _tiktokKeys = {
  appKey: "TIKTOK_SHOP_APP_KEY",
  appSecret: "TIKTOK_SHOP_APP_SECRET",
  accessToken: "TIKTOK_SHOP_ACCESS_TOKEN",
  advertiserId: "TIKTOK_ADVERTISER_ID",
  eventsApiToken: "TIKTOK_EVENTS_API_TOKEN",
} as const;

export const tiktokConfig: TikTokConfig = (() => {
  const appKey = req(_tiktokKeys.appKey);
  const appSecret = req(_tiktokKeys.appSecret);
  const accessToken = req(_tiktokKeys.accessToken);
  const advertiserId = req(_tiktokKeys.advertiserId);
  const eventsApiToken = req(_tiktokKeys.eventsApiToken);

  const missingVars: string[] = [];
  if (!appKey) missingVars.push(_tiktokKeys.appKey);
  if (!appSecret) missingVars.push(_tiktokKeys.appSecret);
  if (!accessToken) missingVars.push(_tiktokKeys.accessToken);
  if (!advertiserId) missingVars.push(_tiktokKeys.advertiserId);
  if (!eventsApiToken) missingVars.push(_tiktokKeys.eventsApiToken);

  return {
    appKey,
    appSecret,
    accessToken,
    advertiserId,
    eventsApiToken,
    mode: appKey && appSecret && accessToken ? "real_ready" : "mock",
    missingVars,
  };
})();

// ── WhatsApp ─────────────────────────────────────────────────────────────────

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  vipGroupUk: string;
  vipGroupHk: string;
  mode: "real_ready" | "mock";
  missingVars: string[];
}

export const whatsappConfig: WhatsAppConfig = (() => {
  const accessToken = req("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = req("WHATSAPP_PHONE_NUMBER_ID");
  const wabaId = req("WHATSAPP_WABA_ID");
  const vipGroupUk = req("WHATSAPP_VIP_GROUP_UK");
  const vipGroupHk = req("WHATSAPP_VIP_GROUP_HK");

  const missingVars: string[] = [];
  if (!accessToken) missingVars.push("WHATSAPP_ACCESS_TOKEN");
  if (!phoneNumberId) missingVars.push("WHATSAPP_PHONE_NUMBER_ID");
  if (!wabaId) missingVars.push("WHATSAPP_WABA_ID");

  return {
    accessToken,
    phoneNumberId,
    wabaId,
    vipGroupUk,
    vipGroupHk,
    mode: accessToken && phoneNumberId && wabaId ? "real_ready" : "mock",
    missingVars,
  };
})();

// ── Discord ───────────────────────────────────────────────────────────────────

export interface DiscordConfig {
  botToken: string;
  guildId: string;
  vipChannelUk: string;
  vipChannelHk: string;
  alertsChannel: string;
  reportsChannel: string;
  mode: "real_ready" | "mock";
  missingVars: string[];
}

export const discordConfig: DiscordConfig = (() => {
  const botToken = req("DISCORD_BOT_TOKEN");
  const guildId = req("DISCORD_GUILD_ID");
  const vipChannelUk = req("DISCORD_VIP_CHANNEL_UK");
  const vipChannelHk = req("DISCORD_VIP_CHANNEL_HK");
  const alertsChannel = req("DISCORD_ALERTS_CHANNEL");
  const reportsChannel = req("DISCORD_REPORTS_CHANNEL");

  const missingVars: string[] = [];
  if (!botToken) missingVars.push("DISCORD_BOT_TOKEN");
  if (!guildId) missingVars.push("DISCORD_GUILD_ID");
  if (!vipChannelUk) missingVars.push("DISCORD_VIP_CHANNEL_UK");
  if (!vipChannelHk) missingVars.push("DISCORD_VIP_CHANNEL_HK");

  return {
    botToken,
    guildId,
    vipChannelUk,
    vipChannelHk,
    alertsChannel,
    reportsChannel,
    mode: botToken && guildId && vipChannelUk && vipChannelHk ? "real_ready" : "mock",
    missingVars,
  };
})();

// ── eBay ─────────────────────────────────────────────────────────────────────

export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  mode: "real_ready" | "mock";
  missingVars: string[];
}

export const ebayConfig: EbayConfig = (() => {
  const clientId = req("EBAY_CLIENT_ID");
  const clientSecret = req("EBAY_CLIENT_SECRET");
  const refreshToken = req("EBAY_REFRESH_TOKEN");

  const missingVars: string[] = [];
  if (!clientId) missingVars.push("EBAY_CLIENT_ID");
  if (!clientSecret) missingVars.push("EBAY_CLIENT_SECRET");
  if (!refreshToken) missingVars.push("EBAY_REFRESH_TOKEN");

  return {
    clientId,
    clientSecret,
    refreshToken,
    mode: clientId && clientSecret && refreshToken ? "real_ready" : "mock",
    missingVars,
  };
})();

// ── OpenAI ───────────────────────────────────────────────────────────────────

export const openaiConfig: { apiKey: string; mode: "real_ready" | "mock" } = {
  apiKey: req("OPENAI_API_KEY"),
  mode: isSet("OPENAI_API_KEY") ? "real_ready" : "mock",
};

// ── Master env summary ────────────────────────────────────────────────────────

export interface EnvSummary {
  shopifyUk: ShopifyStoreConfig;
  shopifyHk: ShopifyStoreConfig;
  tiktok: TikTokConfig;
  whatsapp: WhatsAppConfig;
  discord: DiscordConfig;
  ebay: EbayConfig;
  openai: { apiKey: string; mode: "real_ready" | "mock" };
}

export const envSummary: EnvSummary = {
  shopifyUk: shopifyConfig.uk,
  shopifyHk: shopifyConfig.hk,
  tiktok: tiktokConfig,
  whatsapp: whatsappConfig,
  discord: discordConfig,
  ebay: ebayConfig,
  openai: openaiConfig,
};

// ── Startup validation ────────────────────────────────────────────────────────

function log(prefix: string, icon: string, key: string, value: string) {
  const truncated =
    value.length > 40 ? `${value.slice(0, 37)}...` : value;
  const masked = value
    ? `${truncated.slice(0, 8)}${"*".repeat(Math.max(0, truncated.length - 8))}`
    : "(not set)";
  console.log(`  ${icon} ${key.padEnd(36)} → ${masked}`);
}

function logMissing(key: string) {
  console.log(`  \x1b[31m✗\x1b[0m ${key.padEnd(36)} → \x1b[33mMISSING\x1b[0m`);
}

function logMode(label: string, mode: "real_ready" | "mock") {
  const color = mode === "real_ready" ? "\x1b[32m" : "\x1b[33m";
  const icon = mode === "real_ready" ? "✓" : "⚠";
  console.log(`  ${color}${icon}\x1b[0m ${label} connector → ${color}${mode}\x1b[0m`);
}

/**
 * Call this once at application startup to validate all tokens.
 * Prints a human-readable table to stdout — does not throw.
 */
export function validateEnv(): void {
  const divider = "─".repeat(64);
  console.log(`\n${divider}`);
  console.log("[env] CLOTH — platform token validation");
  console.log(divider);

  // Shopify UK
  console.log("\n[Shopify UK]");
  log("", "✓", "SHOPIFY_UK_STORE_DOMAIN", shopifyConfig.uk.storeDomain);
  log("", "✓", "SHOPIFY_UK_ADMIN_TOKEN", shopifyConfig.uk.adminToken);
  if (shopifyConfig.uk.missingVars.length) {
    shopifyConfig.uk.missingVars.forEach((v) => logMissing(v));
  }
  logMode("Shopify UK", shopifyConfig.uk.mode);

  // Shopify HK
  console.log("\n[Shopify HK]");
  log("", "✓", "SHOPIFY_HK_STORE_DOMAIN", shopifyConfig.hk.storeDomain);
  log("", "✓", "SHOPIFY_HK_ADMIN_TOKEN", shopifyConfig.hk.adminToken);
  if (shopifyConfig.hk.missingVars.length) {
    shopifyConfig.hk.missingVars.forEach((v) => logMissing(v));
  }
  logMode("Shopify HK", shopifyConfig.hk.mode);

  // TikTok
  console.log("\n[TikTok Shop]");
  log("", "✓", "TIKTOK_SHOP_APP_KEY", tiktokConfig.appKey);
  log("", "✓", "TIKTOK_SHOP_APP_SECRET", tiktokConfig.appSecret);
  log("", "✓", "TIKTOK_SHOP_ACCESS_TOKEN", tiktokConfig.accessToken);
  log("", "✓", "TIKTOK_ADVERTISER_ID", tiktokConfig.advertiserId);
  log("", "✓", "TIKTOK_EVENTS_API_TOKEN", tiktokConfig.eventsApiToken);
  if (tiktokConfig.missingVars.length) {
    tiktokConfig.missingVars.forEach((v) => logMissing(v));
  }
  logMode("TikTok Shop", tiktokConfig.mode);

  // WhatsApp
  console.log("\n[WhatsApp Business]");
  log("", "✓", "WHATSAPP_ACCESS_TOKEN", whatsappConfig.accessToken);
  log("", "✓", "WHATSAPP_PHONE_NUMBER_ID", whatsappConfig.phoneNumberId);
  log("", "✓", "WHATSAPP_WABA_ID", whatsappConfig.wabaId);
  log("", "✓", "WHATSAPP_VIP_GROUP_UK", whatsappConfig.vipGroupUk);
  log("", "✓", "WHATSAPP_VIP_GROUP_HK", whatsappConfig.vipGroupHk);
  if (whatsappConfig.missingVars.length) {
    whatsappConfig.missingVars.forEach((v) => logMissing(v));
  }
  logMode("WhatsApp", whatsappConfig.mode);

  // Discord
  console.log("\n[Discord]");
  log("", "✓", "DISCORD_BOT_TOKEN", discordConfig.botToken);
  log("", "✓", "DISCORD_GUILD_ID", discordConfig.guildId);
  log("", "✓", "DISCORD_VIP_CHANNEL_UK", discordConfig.vipChannelUk);
  log("", "✓", "DISCORD_VIP_CHANNEL_HK", discordConfig.vipChannelHk);
  log("", "✓", "DISCORD_ALERTS_CHANNEL", discordConfig.alertsChannel);
  log("", "✓", "DISCORD_REPORTS_CHANNEL", discordConfig.reportsChannel);
  if (discordConfig.missingVars.length) {
    discordConfig.missingVars.forEach((v) => logMissing(v));
  }
  logMode("Discord", discordConfig.mode);

  // eBay
  console.log("\n[eBay]");
  log("", "✓", "EBAY_CLIENT_ID", ebayConfig.clientId);
  log("", "✓", "EBAY_CLIENT_SECRET", ebayConfig.clientSecret);
  log("", "✓", "EBAY_REFRESH_TOKEN", ebayConfig.refreshToken);
  if (ebayConfig.missingVars.length) {
    ebayConfig.missingVars.forEach((v) => logMissing(v));
  }
  logMode("eBay", ebayConfig.mode);

  // OpenAI
  console.log("\n[OpenAI]");
  log("", "✓", "OPENAI_API_KEY", openaiConfig.apiKey);
  logMode("OpenAI", openaiConfig.mode);

  console.log(`\n${divider}`);
  const missing = [
    ...shopifyConfig.uk.missingVars,
    ...shopifyConfig.hk.missingVars,
    ...tiktokConfig.missingVars,
    ...whatsappConfig.missingVars,
    ...discordConfig.missingVars,
    ...ebayConfig.missingVars,
  ];
  if (missing.length) {
    console.log(
      `[env] \x1b[33m${missing.length} token(s) missing — connectors running in mock mode.\x1b[0m`
    );
    console.log(`[env] See docs/ENV_SETUP.md for setup instructions.\n`);
  } else {
    console.log(`[env] \x1b[32mAll platform tokens configured.\x1b[0m\n`);
  }
  console.log(divider);
}

// Auto-run validation on module import (runs once when this module is loaded)
validateEnv();
