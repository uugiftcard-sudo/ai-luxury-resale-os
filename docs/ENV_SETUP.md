# Environment Configuration Guide

> How to obtain and configure all platform tokens required by the CLOTH system.
> Status: **IN PROGRESS** — Shopify UK/HK + TikTok Shop tokens pending.

---

## Table of Contents

1. [Audit: Current State](#1-audit-current-state)
2. [Required Variables Reference](#2-required-variables-reference)
3. [Shopify: UK Store Setup](#3-shopify-uk-store-setup)
4. [Shopify: HK Store Setup](#4-shopify-hk-store-setup)
5. [TikTok Shop Setup](#5-tiktok-shop-setup)
6. [WhatsApp Business Setup](#6-whatsapp-business-setup)
7. [Discord Setup](#7-discord-setup)
8. [eBay Setup](#8-ebay-setup)
9. [Meta / Snapchat Setup](#9-meta--snapchat-setup)
10. [Env Validation + Startup](#10-env-validation--startup)
11. [Validation Checklist](#11-validation-checklist)
12. [What Breaks Without Each Token](#12-what-breaks-without-each-token)

---

## 1. Audit: Current State

All values in `.env.example` are **empty/placeholder** — no real tokens configured.

| Category | Variables | Status |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | ❌ Missing |
| Shopify | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_UK_STORE_DOMAIN`, `SHOPIFY_HK_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN` | ❌ All missing |
| TikTok Shop | `TIKTOK_SHOP_APP_KEY`, `TIKTOK_SHOP_APP_SECRET`, `TIKTOK_SHOP_ACCESS_TOKEN` | ❌ All missing |
| TikTok Ads | `TIKTOK_ADVERTISER_ID`, `TIKTOK_EVENTS_API_TOKEN` | ❌ All missing |
| Discord | `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_VIP_CHANNEL_UK`, `DISCORD_VIP_CHANNEL_HK`, `DISCORD_ALERTS_CHANNEL`, `DISCORD_REPORTS_CHANNEL` | ❌ All missing |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID` | ❌ All missing |
| eBay | `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_REFRESH_TOKEN` | ❌ All missing |
| Snapchat Ads | `SNAPCHAT_AD_ACCOUNT_ID`, `SNAPCHAT_CLIENT_ID`, `SNAPCHAT_CLIENT_SECRET`, `SNAPCHAT_REFRESH_TOKEN` | ❌ All missing |
| Meta Ads | `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | ❌ All missing |
| Payments | `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | ❌ All missing |

> ⚠️ **The system runs in mock mode without these tokens.** Nothing is blocked — everything gracefully degrades to mock payloads. Adding tokens switches connectors to `real_ready` mode.

---

## 2. Required Variables Reference

### Shopify (Core — UK + HK)

| Variable | Description | Where to Find |
|---|---|---|
| `SHOPIFY_UK_STORE_DOMAIN` | Your UK store domain, e.g. `yourstore.myshopify.com` | Shopify Admin → Settings → Domains |
| `SHOPIFY_HK_STORE_DOMAIN` | Your HK store domain | Same as UK |
| `SHOPIFY_ADMIN_TOKEN` | Admin API access token (shared, or set per-store) | Shopify Admin → Apps → Develop apps → API credentials |
| `SHOPIFY_UK_ADMIN_TOKEN` | *(optional)* Per-store admin token for UK | Same |
| `SHOPIFY_HK_ADMIN_TOKEN` | *(optional)* Per-store admin token for HK | Same |

> ⚠️ The current code reads **`SHOPIFY_ADMIN_TOKEN`** as a single token for both stores (`listing-executor.ts` line 178). For strict per-store isolation, use the per-market tokens instead.

### TikTok Shop

| Variable | Description | Where to Find |
|---|---|---|
| `TIKTOK_SHOP_APP_KEY` | TikTok Shop Partner App Key | TikTok Shop Partner Portal |
| `TIKTOK_SHOP_APP_SECRET` | TikTok Shop Partner App Secret | TikTok Shop Partner Portal |
| `TIKTOK_SHOP_ACCESS_TOKEN` | OAuth access token | Obtained via OAuth flow with App Key + Secret |
| `TIKTOK_ADVERTISER_ID` | TikTok Ads Manager Advertiser ID | TikTok Ads Manager → Account |
| `TIKTOK_EVENTS_API_TOKEN` | TikTok Events API Server Access Token | TikTok Events Manager → Data Source → Server Access Token |

### Other Platforms

| Platform | Key Variables |
|---|---|
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WABA_ID` |
| Discord | `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_VIP_CHANNEL_UK`, `DISCORD_VIP_CHANNEL_HK` |
| eBay | `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_REFRESH_TOKEN` |
| Snapchat | `SNAPCHAT_AD_ACCOUNT_ID`, `SNAPCHAT_CLIENT_ID`, `SNAPCHAT_CLIENT_SECRET` |
| Meta | `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` |

---

## 3. Shopify: UK Store Setup

### Step 1: Create a Custom App in Shopify

1. Log into **Shopify Admin** for your UK store.
2. Go to **Apps → Develop apps** (top right).
3. Click **Allow app development** if prompted.
4. Click **Create an app** → name it `CLOTH Agent System` (or any name).
5. Click **Configure Admin API scopes**.
6. Select the following scopes:

```
read_products     ✓
write_products    ✓
read_inventory    ✓
write_inventory   ✓
read_orders       ✓
write_orders      ✓
read_fulfillments ✓
write_fulfillments ✓
```

7. Click **Save** → **Install app**.
8. You now see the **API credentials** screen.

### Step 2: Get the Admin API Access Token

On the API credentials screen:

- **API key** = your `SHOPIFY_ADMIN_TOKEN` (called "Admin API access token" in Shopify UI)
- Click **Install app** if not already installed
- The access token is shown **once** — copy it immediately and store it safely

### Step 3: Get the Store Domain

- Shopify Admin → **Settings → Domains**
- Copy the primary domain: e.g. `yourstore.myshopify.com`
- This is your `SHOPIFY_UK_STORE_DOMAIN`

### Step 4: Configure in .env

```bash
SHOPIFY_UK_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Validate

```bash
# Test the token with a quick API call
curl -X GET "https://yourstore.myshopify.com/admin/api/2024-01/shop.json" \
  -H "X-Shopify-Access-Token: shpat_xxxxx"
```

Expected: Returns JSON with shop details (shop name, owner, etc.)

---

## 4. Shopify: HK Store Setup

Repeat the same process for your **HK Shopify store**:

1. Log into the HK Shopify Admin.
2. Create a custom app (can be the same app if using a Shopify Plus multi-store setup, or a separate app).
3. Install Admin API scopes (same as UK).
4. Get the Admin API access token.
5. Copy the HK store domain.

```bash
SHOPIFY_HK_STORE_DOMAIN=yourhkstore.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_yyyyyyyyyyyyyyyyyyyyyyyyyy
```

> **Note:** If both stores share the same Shopify account/Org, you can use the **same Admin API token** to access both stores by passing the correct store domain in the API call. If using separate Shopify accounts, you need separate tokens.

---

## 5. TikTok Shop Setup

### Overview

TikTok Shop integration requires **TikTok Shop Partner** status (available to UK sellers). The HK market uses the **TikTok content pipeline** first (no direct TikTok Shop API for HK at this stage).

### Step 1: Apply for TikTok Shop Partner Access (UK)

1. Go to [seller-uk.tiktok.com](https://seller-uk.tiktok.com) → Sign up as a seller.
2. Complete seller verification (business registration, ID verification).
3. Once approved, go to **Developer Portal** (or partner portal).
4. Create a **Partner App**.

### Step 2: Get App Key + App Secret

- In the TikTok Developer Portal → Your App → Credentials
- **App Key** = `TIKTOK_SHOP_APP_KEY`
- **App Secret** = `TIKTOK_SHOP_APP_SECRET`

### Step 3: OAuth Flow to Get Access Token

Once you have App Key + Secret, exchange for an access token:

```bash
POST https://auth.tiktok-shops.com/oauth/token

Body (form-urlencoded):
  app_id=YOUR_APP_KEY
  app_secret=YOUR_APP_SECRET
  auth_code=YOUR_AUTH_CODE
  grant_type=authorized_code

# Response:
# { "access_token": "...", "expires_in": 3600, "refresh_token": "..." }
```

> Note: `auth_code` is obtained by authorizing your app from the TikTok Seller Center.

### Step 4: Get TikTok Advertiser ID

1. Log into [ads.tiktok.com](https://ads.tiktok.com).
2. Go to **Settings → Account**.
3. Your **Advertiser ID** is shown — copy it.

```bash
TIKTOK_ADVERTISER_ID=123456789
```

### Step 5: Get TikTok Events API Token

1. In TikTok Ads Manager → **Events Manager**.
2. Select your advertiser account.
3. Go to **Data Sources → Server**.
4. Click **Generate Access Token**.
5. Copy the token.

```bash
TIKTOK_EVENTS_API_TOKEN=YOUR_EVENTS_API_TOKEN
```

### What Currently Works Without TikTok Tokens

The `platform-connectors` module generates **mock TikTok payloads** — video hooks, live talking points, proof-first notes, and ad briefs are all produced locally. The tokens only enable:

- Actual product listing via TikTok Shop API
- Pixel event forwarding (server-side)
- Ad campaign creation via TikTok Ads API

---

## 6. WhatsApp Business Setup

### Step 1: Create WhatsApp Business Account

1. Go to [business.facebook.com](https://business.facebook.com).
2. Create a Business Manager account.
3. Add **WhatsApp Business** product.
4. Register a phone number (this becomes your WhatsApp Business number).

### Step 2: Get WhatsApp Business Account ID (WABA ID)

- Business Manager → WhatsApp → Your Phone Number → **WABA ID** (starts with `XXXXXXXXXX`)
- This is `WHATSAPP_WABA_ID`

### Step 3: Get Phone Number ID

- Business Manager → WhatsApp → Your Phone Number → **Phone Number ID**
- This is `WHATSAPP_PHONE_NUMBER_ID`

### Step 4: Get Permanent Access Token

1. Go to **Meta Developer Console** → your app.
2. Add **WhatsApp Business Management API** product.
3. Under "WhatsApp Business Account" → Generate a **permanent** access token.
4. Copy the token.

```bash
WHATSAPP_ACCESS_TOKEN=EAAALongAccessTokenString...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_WABA_ID=9876543210
```

### Step 5: Get VIP Group IDs (Optional — for WhatsApp VIP drops)

- Open WhatsApp Desktop on your computer.
- Right-click the VIP group → **Copy group link** (or use WhatsApp Business API to get the group JID).
- The system uses `WHATSAPP_VIP_GROUP_UK` and `WHATSAPP_VIP_GROUP_HK` for targeted drops.

---

## 7. Discord Setup

### Step 1: Create a Discord Bot

1. Go to [discord.com/developers](https://discord.com/developers).
2. Click **New Application** → name it `CLOTH Agent`.
3. Go to **Bot** tab → click **Reset Token** → copy the **Bot Token**.
4. Enable **Message Content Intent** under **Privileged Gateway Intents**.

```bash
DISCORD_BOT_TOKEN=ODYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Create Your Server

1. In Discord, create a server (or use an existing one).
2. Copy the **Server ID**: Right-click server name → Copy Server ID (enable Developer Mode first: Settings → Advanced → Developer Mode).

```bash
DISCORD_GUILD_ID=123456789012345678
```

### Step 3: Create Required Channels

Create these text channels in your server:

| Channel Name | Purpose | `DISCORD_` Variable |
|---|---|---|
| `vip-uk` | UK VIP drops and announcements | `DISCORD_VIP_CHANNEL_UK` |
| `vip-hk` | HK VIP drops and announcements | `DISCORD_VIP_CHANNEL_HK` |
| `alerts` | Agent alerts, errors, escalations | `DISCORD_ALERTS_CHANNEL` |
| `reports` | Daily execution reports | `DISCORD_REPORTS_CHANNEL` |

Right-click each channel → Copy Channel ID.

```bash
DISCORD_VIP_CHANNEL_UK=111111111111111111
DISCORD_VIP_CHANNEL_HK=222222222222222222
DISCORD_ALERTS_CHANNEL=333333333333333333
DISCORD_REPORTS_CHANNEL=444444444444444444
```

### Step 4: Invite Bot to Server

1. Discord Developer Portal → Your Bot → **OAuth2 → URL Generator**.
2. Check scopes: `bot`, `applications.commands`.
3. Check permissions: `Send Messages`, `Embed Links`, `Read Message History`.
4. Copy the generated URL → open in browser → select your server.

---

## 8. eBay Setup

### Step 1: Create eBay Developer Account

1. Go to [developer.ebay.com](https://developer.ebay.com).
2. Sign up for a developer account.
3. Create an application → copy **Client ID** and **Client Secret**.

```bash
EBAY_CLIENT_ID=YourClientID
EBAY_CLIENT_SECRET=YourClientSecret
```

### Step 2: Get OAuth Refresh Token

eBay uses **OAuth 2.0** — the refresh token is long-lived:

1. Go to **My eBay → Application Access** (or the developer dashboard).
2. Follow the **OAuth flow** to get your initial refresh token.
3. Store it securely.

```bash
EBAY_REFRESH_TOKEN=YourRefreshToken
```

---

## 9. Meta / Snapchat Setup

### Meta (Facebook) Ads

1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Create an app → type: **Business**.
3. Add **Marketing API** product.
4. Go to **Tools → Graph API Explorer** → get a **User Access Token**.
5. Use it to get a **Page Access Token** and **Ad Account ID**.

```bash
META_APP_ID=1234567890
META_APP_SECRET=yourappsecret
META_ACCESS_TOKEN=EAAALongTokenString...
META_AD_ACCOUNT_ID=act_123456789
```

### Snapchat Ads

1. Go to [ads.snapchat.com](https://ads.snapchat.com) → Create an account.
2. Go to **Settings → API Access**.
3. Create OAuth credentials → copy Client ID and Client Secret.

```bash
SNAPCHAT_AD_ACCOUNT_ID=abc123def
SNAPCHAT_CLIENT_ID=yourclientid
SNAPCHAT_CLIENT_SECRET=yourclientsecret
SNAPCHAT_REFRESH_TOKEN=yourrefreshtoken
```

---

## 10. Env Validation + Startup

The system includes a typed environment config module at `packages/db/src/env.ts`. It validates all required variables on startup and prints warnings for missing ones (without blocking the dev server).

### What the Validator Checks

```typescript
// Required for real Shopify sync:
SHOPIFY_ADMIN_TOKEN
SHOPIFY_UK_STORE_DOMAIN   // for UK products
SHOPIFY_HK_STORE_DOMAIN   // for HK products

// Required for real TikTok Shop:
TIKTOK_SHOP_APP_KEY
TIKTOK_SHOP_APP_SECRET
TIKTOK_SHOP_ACCESS_TOKEN

// Required for real Discord:
DISCORD_BOT_TOKEN
DISCORD_GUILD_ID
DISCORD_VIP_CHANNEL_UK
DISCORD_VIP_CHANNEL_HK
```

### Startup Output (example)

```
[env] CLOTH environment check:
[env] ✓ SHOPIFY_UK_STORE_DOMAIN  → yourstore.myshopify.com
[env] ✓ SHOPIFY_ADMIN_TOKEN       → shpat_xxxxxxx
[env] ✗ SHOPIFY_HK_STORE_DOMAIN  → MISSING (HK listings will use mock mode)
[env] ✗ TIKTOK_SHOP_APP_KEY     → MISSING (TikTok Shop sync disabled)
[env] ⚠ SHOPIFY_UK connector    → real_ready
[env] ⚠ SHOPIFY_HK connector    → mock (missing token)
[env] ⚠ TikTok Shop connector   → mock (missing tokens)
```

---

## 11. Validation Checklist

Run through this checklist to confirm your setup is complete:

### Shopify UK ✅
- [ ] Store domain in `SHOPIFY_UK_STORE_DOMAIN`
- [ ] Admin API token in `SHOPIFY_ADMIN_TOKEN`
- [ ] API scopes granted: `read_products`, `write_products`, `read_orders`, `write_orders`
- [ ] `curl` test returns shop JSON (see Step 3 above)

### Shopify HK ✅
- [ ] HK store domain in `SHOPIFY_HK_STORE_DOMAIN`
- [ ] HK Admin API token in `SHOPIFY_ADMIN_TOKEN` (or `SHOPIFY_HK_ADMIN_TOKEN`)
- [ ] Same scopes granted on HK store

### TikTok Shop ✅
- [ ] TikTok Seller account approved (UK)
- [ ] App Key + App Secret in `.env`
- [ ] Access token obtained via OAuth
- [ ] Advertiser ID in `TIKTOK_ADVERTISER_ID`
- [ ] Events API token in `TIKTOK_EVENTS_API_TOKEN`

### WhatsApp ✅
- [ ] Business Manager account created
- [ ] Phone number registered
- [ ] WABA ID, Phone Number ID, Access Token in `.env`

### Discord ✅
- [ ] Bot created in Developer Portal
- [ ] Bot token in `DISCORD_BOT_TOKEN`
- [ ] Server ID in `DISCORD_GUILD_ID`
- [ ] All 4 channels created and IDs in `.env`
- [ ] Bot invited to server

### Post-Setup Verification ✅
- [ ] Restart dev server: `npm run dev`
- [ ] Check startup output — no `✗` markers for critical tokens
- [ ] Run: `npm run test:scenarios` — all tests pass
- [ ] Run: `npm run check` (TypeScript check) — no errors
- [ ] Test a Shopify payload: check `mode` switches from `mock` to `real_ready`

---

## 12. What Breaks Without Each Token

| Token | What Stops Working |
|---|---|
| `SHOPIFY_UK_STORE_DOMAIN` | UK Shopify listing sync, order management |
| `SHOPIFY_HK_STORE_DOMAIN` | HK Shopify listing sync |
| `SHOPIFY_ADMIN_TOKEN` | All Shopify product create/update API calls (both stores) |
| `TIKTOK_SHOP_APP_KEY/SECRET` | TikTok Shop API listing, OAuth token refresh |
| `TIKTOK_SHOP_ACCESS_TOKEN` | TikTok Shop product posting |
| `TIKTOK_ADVERTISER_ID` | TikTok Ads campaign creation |
| `TIKTOK_EVENTS_API_TOKEN` | Server-side TikTok pixel event forwarding |
| `WHATSAPP_*` | WhatsApp VIP drops, customer broadcasts |
| `DISCORD_BOT_TOKEN` | Discord VIP drops, reports, alerts |
| `EBAY_*` | eBay listing, inventory sync |
| `SNAPCHAT_*` | Snapchat ad campaigns |
| `META_*` | Meta/Facebook ad campaigns |
| `OPENAI_API_KEY` | AI-generated listing copy, customer support replies, video scripts |

> ✅ **All of the above degrade gracefully to mock mode.** The system continues to generate valid payloads locally and prints clear warnings at startup.

---

## Quick Start: Minimum Viable Setup

To get the Shopify UK connector to `real_ready` mode, you only need:

```bash
# In .env.local (never commit this file!)
SHOPIFY_UK_STORE_DOMAIN=yourstore.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
```

Once these two are set, `platform-connectors` will automatically switch from `mock` to `real_ready` for UK Shopify listings.

---

*Last updated: 2026-05-23*
