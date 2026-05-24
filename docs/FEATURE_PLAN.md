# CLOTH — Feature Plan & UI Design Blueprint

> **Context:** This document is the authoritative reference for what to build next in CLOTH.
> It covers all planned-but-unimplemented features, their priority, and their design specification.
> Updated after full project analysis — May 2025.

---

## Priority Framework

| Symbol | Label | Meaning |
|--------|-------|---------|
| 🔴 P0 | Critical | Blocks core business operations |
| 🟡 P1 | High | Major feature gaps; degrades UX significantly |
| 🔵 P2 | Medium | Nice-to-have; significant UX improvement |
| ⚪ P3 | Low | Polish; not urgent |

---

## P0 — Critical: Backend API Routes

### P0-A: Finance API Routes
**Files to create:** `api/src/routes/finance.ts`

The `web/src/api/finance.ts` client exists and calls `/api/finance*`. No Express route handles these.
All Finance CRUD operations fail silently.

**Routes to implement:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/finance` | List records (supports `?type=income\|expense&from=&to=&market=`) |
| GET | `/api/finance/:id` | Single record |
| POST | `/api/finance` | Create record (type, amount, description, market, category, date) |
| PUT | `/api/finance/:id` | Update record |
| DELETE | `/api/finance/:id` | Delete record |

**Finance record schema:**
```typescript
interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number; // always CNY
  description: string;
  category: 'product_sale' | 'platform_fee' | 'shipping' | 'acquisition_cost' | 'marketing' | 'ops' | 'other';
  market: 'UK' | 'HK' | 'CN' | 'ALL';
  relatedOrderId?: string;
  createdAt: string;
  updatedAt?: string;
}
```

**Data store:** Add `financeRecords: FinanceRecord[]` to `api/src/models/store.ts`.

**Stats endpoint:** `GET /api/finance/stats` returns:
```json
{
  "totalIncome": 0,
  "totalExpenses": 0,
  "netProfit": 0,
  "byMarket": { "UK": { "income": 0, "expense": 0, "net": 0 }, "HK": {...}, "CN": {...} },
  "byCategory": { "platform_fee": 0, "shipping": 0, ... }
}
```

---

### P0-B: Inventory API Routes
**Files to create:** `api/src/routes/inventory.ts`

The `web/src/api/inventory.ts` client exists. No Express route handles these.

**Routes to implement:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List stock items (supports `?status=in_stock\|low_stock\|out_of_stock`) |
| GET | `/api/inventory/:id` | Single item |
| POST | `/api/inventory` | Create stock item |
| PUT | `/api/inventory/:id` | Update stock item |
| DELETE | `/api/inventory/:id` | Delete stock item |
| POST | `/api/inventory/:id/inbound` | Record stock received |
| POST | `/api/inventory/:id/outbound` | Record stock dispatched |
| GET | `/api/inventory/alerts` | Low-stock + out-of-stock items |

**Inventory item schema:**
```typescript
interface InventoryItem {
  id: string;
  productId?: string; // link to product if listed
  sku: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  minStock: number; // alert threshold
  location: string; // e.g. "UK-WH-A-12", "HK-WH-B-03"
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt?: string;
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'inbound' | 'outbound';
  quantity: number;
  reference?: string; // order ID or PO number
  notes?: string;
  createdAt: string;
}
```

**Data store:** Add `inventoryItems: InventoryItem[]` and `inventoryTransactions: InventoryTransaction[]` to `api/src/models/store.ts`.

---

### P0-C: Support API Routes
**Files to create:** `api/src/routes/support.ts`

**Routes to implement:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/support/tickets` | List tickets (supports `?status=open\|resolved\|pending`) |
| GET | `/api/support/tickets/:id` | Single ticket with messages |
| POST | `/api/support/tickets` | Create new ticket |
| PUT | `/api/support/tickets/:id` | Update ticket (status, priority, assignee) |
| POST | `/api/support/tickets/:id/messages` | Add reply/message to ticket |
| GET | `/api/support/faqs` | List FAQs |

**Ticket schema:**
```typescript
interface SupportTicket {
  id: string;
  subject: string;
  body: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'order' | 'product' | 'payment' | 'returns' | 'general';
  customerEmail: string;
  customerName: string;
  orderId?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt?: string;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  author: 'customer' | 'agent';
  authorName: string;
  body: string;
  createdAt: string;
}
```

**Data store:** Add `supportTickets: SupportTicket[]` and `supportFaqs: SupportFaq[]` to `api/src/models/store.ts`.

---

## P0-D: Persistent Storage Layer

**Problem:** In-memory storage wipes on every server restart. All products, orders, finance, inventory are lost.

**Solution:** Add `better-sqlite3` as a lightweight embedded database.

**Files to create/modify:**
- `api/src/db/index.ts` — SQLite connection + table creation
- `api/src/db/migrations/` — schema migration scripts
- `api/src/models/store.ts` — refactor to use SQLite queries instead of in-memory arrays
- `package.json` — add `better-sqlite3` dependency

**Schema (Phase 1):**
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price REAL NOT NULL,
  original_price REAL,
  condition TEXT,
  size TEXT,
  description TEXT,
  images TEXT, -- JSON array
  platform TEXT,
  status TEXT DEFAULT '待售',
  market TEXT DEFAULT 'ALL',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_address TEXT,
  status TEXT DEFAULT '待付款',
  total_price REAL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE finance_records (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT,
  market TEXT DEFAULT 'ALL',
  related_order_id TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 3,
  location TEXT,
  status TEXT DEFAULT 'in_stock',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE inventory_transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TEXT
);

CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT,
  customer_email TEXT,
  customer_name TEXT,
  order_id TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  author TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE support_faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0
);
```

**Phase 2** (future): Add `sourcing_leads`, `agent_runs`, `listing_queue`, `content_queue` tables.

---

## P1 — High Priority Features

### P1-A: User Authentication + Account Pages

**Scope:** Replace anonymous cart/orders with authenticated user accounts.

**User flow:**
1. Register with email + password (or login via email magic link)
2. Profile page: saved addresses, default payment method, preferences
3. Order history page: past orders with status tracking
4. Wishlist: saved items across sessions (localStorage → persisted to DB)
5. Saved addresses: multiple shipping addresses, mark default

**Files to create:**
- `api/src/routes/auth.ts` — register, login, logout, refresh-token
- `api/src/routes/users.ts` — profile, addresses
- `api/src/middleware/auth.ts` — JWT verification middleware
- `web/src/pages/Auth.tsx` — Login / Register page
- `web/src/pages/Account.tsx` — Profile + addresses
- `web/src/pages/Wishlist.tsx` — Saved items

**Auth flow:**
```
Register → POST /api/auth/register → { id, email, name }
Login → POST /api/auth/login → { token, user }
Token stored in localStorage → sent as Bearer header
Protected routes verify token via middleware
```

**JWT payload:** `{ userId, email, role: 'customer' | 'admin', iat, exp }`

**Registration fields:** email, password (hashed with bcrypt), full name, phone (optional)

**Note:** This is for customer auth only. Admin auth (password-protected warehouse page) already exists.

---

### P1-B: Wishlist Feature

**Storage:** `localStorage` key `cloth_wishlist` → array of product IDs.
**Persistence:** Sync wishlist to user account when logged in.

**UI changes:**
- `ProductCard` — add heart icon button (top-right corner). Filled = wishlisted.
- `Header` — add wishlist icon with count badge
- New page: `/wishlist` — grid of wishlisted products with remove buttons
- On product detail page: add "Save to Wishlist" button

**States:**
- Not wishlisted: outline heart, `color: var(--color-text-muted)`
- Wishlisted: filled heart, `color: var(--color-accent)`
- Hover: scale(1.1), transition 150ms

---

### P1-C: Enhanced Admin Product Form

**Problem:** Current admin product form accepts image URLs as newline-separated text. No image upload.

**New features:**
- Drag-and-drop image upload zone → uploads to Cloudinary/S3 → returns URL
- Multi-image gallery reordering (drag to reorder)
- Brand autocomplete (from `GET /api/brands`)
- Category dropdown (from `GET /api/categories`)
- Condition selector (radio chips)
- Market scope selector (UK/HK/CN/ALL checkboxes)
- Size matrix: if multiple sizes, create variant rows
- Bulk CSV import button (upload CSV → batch create products)
- Duplicate product button (pre-fill form with existing product data)

**Image upload endpoint:**
```
POST /api/upload
Body: FormData { file: File }
Response: { url: "https://..." }
```
For Phase 1: Use Cloudinary unsigned upload preset.
For Phase 2: Custom S3 presigned URLs.

---

### P1-D: Mobile Responsive Navigation

**Problem:** `Header` has a mobile menu button but no functional mobile nav.

**Implementation:**
- Breakpoint: `768px`
- Below breakpoint: hamburger icon replaces nav links
- Mobile menu: full-screen overlay, slides in from right
- Menu items: Home, Products, Cart (with badge), Wishlist, Orders, Support
- Admin link shown only if `localStorage.admin === 'true'`
- Close button (X) top-right
- Click outside or close button to dismiss

**CSS additions in `Header.module.css`:**
```css
@media (max-width: 768px) {
  .desktopNav { display: none; }
  .menuBtn { display: flex; }
  .mobileNav { /* slide-in overlay */ }
}
```

---

## P2 — Medium Priority Features

### P2-A: Price Filter in ProductList

Add min/max price inputs in the filter bar. Filters are applied client-side from the fetched product list (for Phase 1 — server-side filter in Phase 2).

```
Price: [¥____] — [¥____] [Apply]
```

Display currency matches current market (CNY/GBP/HKD).

---

### P2-B: Real-Time Stock Badge on ProductDetail

Fetch inventory status from `/api/inventory/:productId` and show:
- ✅ "In Stock" (green badge) — quantity > 3
- ⚠️ "Low Stock — only X left" (amber badge) — quantity 1–3
- ❌ "Out of Stock" (red badge) — quantity 0, disable buy button

---

### P2-C: Order Status Notification System

When order status changes (in Admin or via API), send real-time notification:
- Email to customer (via SendGrid/Resend)
- Optional: Discord webhook to ops channel
- In-app: toast notification on the Orders page

**Files to create:**
- `api/src/routes/notifications.ts` — email + Discord webhook
- `web/src/hooks/useOrderNotifications.ts` — SSE or polling for order status changes

---

### P2-D: Product Comparison Tool

Allow customers to compare up to 3 products side-by-side.
- Add "Compare" button to `ProductCard` (toggle)
- `/compare` page shows a 3-column table: images, brand, price, condition, size, material, description

---

### P2-E: Seller/Admin Commission Dashboard

For future multi-seller marketplace (Phase 3), add:
- Per-seller commission tracking
- Payout schedule
- Earnings breakdown by product

For Phase 2: Add a **financial summary page** to Admin:
- Total GMV (all markets)
- Platform fee breakdown
- Net revenue per market
- Monthly P&L chart

---

### P2-F: Multi-Language Product Filtering

The product list currently filters by market but doesn't allow language filtering. For UK/HK markets:
- Show product title + description in the appropriate language (EN/繁)
- Add language toggle in product list header

---

### P2-G: Enhanced ProductDetail Gallery

Current gallery is basic. Upgrade to:
- Thumbnail strip below main image
- Zoom on hover (scale + transform-origin follows cursor)
- Full-screen lightbox on click
- Keyboard navigation (left/right arrows)

---

## P3 — Low Priority / Polish

### P3-A: Order Tracking Integration
Link order status to real courier APIs (AfterShip, 17TRACK) to show real tracking on the order detail page.

### P3-B: Returns & Refunds Flow
- Return request form in account page
- Admin approval workflow
- Refund status tracking

### P3-C: Affiliate / Referral Program
- Unique referral codes
- Commission tracking
- Referral dashboard

### P3-D: Blog / Editorial Content
- Luxury fashion editorial (styled as `luxury-magazine` page)
- SEO landing pages for branded searches (e.g. `/brand/burberry`)

### P3-E: Push Notifications
- Service worker for browser push notifications
- Notify on order status change, wishlist price drop

---

## Implementation Order

### Phase 1 (Do First)
1. **SQLite persistence** — makes everything survivable across restarts
2. **Finance API routes** — makes Finance page functional
3. **Inventory API routes** — makes Inventory page functional
4. **Support API routes** — makes Support page functional
5. **Mobile nav** — visible UX improvement, low effort

### Phase 2
6. **User auth + account pages** — unlocks wishlist persistence + order history
7. **Wishlist feature** — tied to auth
8. **Enhanced admin product form** — image upload + bulk import

### Phase 3
9. **Price filter** — product list enhancement
10. **Stock badges** — inventory → product detail integration
11. **Order notifications** — email + Discord webhooks
12. **Product comparison** — discovery UX

### Phase 4 (Future)
13. Real Shopify sync (with real tokens)
14. TikTok Shop integration
15. Multi-seller marketplace
16. Returns & refunds flow

---

## UI Design Guidelines

All new pages and components must follow the existing design system:

### Typography
- **Display:** `Cormorant Garamond` — hero titles, page headings
- **Serif:** `Playfair Display` — section headings, card titles
- **Body:** `DM Sans` — all body text, labels, buttons

### Colors (CSS Variables)
```css
--color-bg: #faf8f4;
--color-surface: #ffffff;
--color-border: #e8e4df;
--color-text: #1a1a18;
--color-text-secondary: #6b6560;
--color-text-muted: #9e9893;
--color-accent: #c9a96e;
--color-accent-dark: #a8884e;
--color-accent-light: #e8d5b0;
--color-success: #4a7c59;
--color-warning: #c9a96e;
--color-error: #c0392b;
--color-info: #2c5282;
```

### Spacing Scale
`4 / 8 / 16 / 24 / 40 / 64 / 96px`

### Motion
- **Page transitions:** `fadeIn 300ms ease-out`
- **Card hovers:** `transform translateY(-2px)` + shadow lift, `200ms ease`
- **Modal open:** `fadeIn + scale(0.96→1)`, `250ms ease-out`
- **Toast:** `slideInRight`, auto-dismiss after `4000ms`
- **Button press:** `scale(0.98)`, `100ms ease`
- **Loading skeletons:** `shimmer` animation

### Component Patterns
- All buttons use `.btn .btn-primary` or `.btn .btn-secondary`
- All cards use `.card` class
- All forms use `.form-group > .form-label + .form-input`
- Badges use `.badge` with contextual color variants
- Empty states use `.empty-state` with icon + message + CTA
- Modals use `.modal-overlay + .modal-content`
- Tables use consistent padding: `12px 16px` per cell, alternating row backgrounds

### New Page Structure
Every new page should follow this structure:
```
page-header: breadcrumb + title + optional action button
page-body: content
```
Use the existing `.page`, `.page-header`, `.page-body` global classes.

### Responsive Strategy
- Mobile-first: design for 375px, then scale up
- Breakpoints: `sm: 480px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Use CSS Grid with `repeat(auto-fill, minmax(280px, 1fr))` for product grids
- Tables become card lists on mobile
- Forms become single-column on mobile
- Modals become full-screen sheets on mobile

---

## File Creation Checklist

When implementing each feature, update this checklist:

- [ ] `api/src/routes/finance.ts` — Finance CRUD + stats
- [ ] `api/src/routes/inventory.ts` — Inventory CRUD + transactions
- [ ] `api/src/routes/support.ts` — Tickets CRUD + messages + FAQs
- [ ] `api/src/db/index.ts` — SQLite setup
- [ ] `api/src/db/migrations/001_initial.sql` — All tables
- [ ] `api/src/models/store.ts` — Refactored to SQLite
- [ ] `api/src/routes/auth.ts` — Register, login, logout
- [ ] `api/src/routes/users.ts` — Profile, addresses
- [ ] `api/src/middleware/auth.ts` — JWT middleware
- [ ] `api/src/routes/upload.ts` — Image upload endpoint
- [ ] `web/src/pages/Auth.tsx` — Login / Register UI
- [ ] `web/src/pages/Account.tsx` — Profile + addresses UI
- [ ] `web/src/pages/Wishlist.tsx` — Saved items UI
- [ ] `web/src/hooks/useWishlist.ts` — Wishlist state + localStorage
- [ ] `web/src/components/Header.tsx` — Updated with wishlist icon + mobile nav
- [ ] `web/src/components/Header.module.css` — Mobile nav styles
- [ ] `web/src/pages/Admin.tsx` — Enhanced product form
- [ ] `web/src/App.tsx` — New routes for Auth, Account, Wishlist
- [ ] `docs/FEATURE_PLAN.md` — This document
