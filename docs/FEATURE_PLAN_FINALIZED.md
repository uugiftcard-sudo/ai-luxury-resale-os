# CLOTH Feature Priority — Finalized v1.0

> 基於：FEATURE_PLAN.md + boss-manual.md
> 版本：2026-05-25

---

## 已確認的優先級决策

### 🔴 Phase 0 — 先解决死人問題（無論幾難都要做）

#### P0-A：SQLite 持久化（最優先）
**原因：** 所有資料（product、order、finance、inventory、support）响 server 重啟後全部消失。呢個唔係「功能」，係「系統崩潰」。

**實作順序：**
1. `api/src/db/index.ts` — SQLite 初始化 + 表格建立
2. `api/src/db/migrations/001_initial.sql` — 所有 Phase 1 表格
3. `api/src/models/store.ts` — 重構為 SQLite wrapper（唔係 memory array）
4. `package.json` — 加 `better-sqlite3` dependency

**Migration 策略：**
- Phase 1 不 migration 現有 data（in-memory 只係 demo）
- Phase 2 migration tool 將 memory → SQLite

**驗收：** server 重啟後 product list 仍然存在。

---

#### P0-B：Finance API（系統財務從未正常）
**原因：** Finance page 完全行唔通，影響运营决策。

**實作：**
- `GET /api/finance` — list with filter
- `GET /api/finance/stats` — summary stats
- `POST /api/finance` — create record
- `PUT /api/finance/:id`
- `DELETE /api/finance/:id`

**驗收：** Finance page 可新增、編輯、刪除、睇 stats。

---

#### P0-C：Inventory API
**原因：**庫存追蹤係運營核心，現有系統冇呢個功能。

**實作：**
- `GET /api/inventory`
- `GET /api/inventory/alerts` — low stock + out of stock
- `POST /api/inventory`
- `POST /api/inventory/:id/inbound` — 入庫記錄
- `POST /api/inventory/:id/outbound` — 出庫記錄

**驗收：** Inventory page 可管理 stock，可記錄進出了。

---

#### P0-D：Support API
**原因：** 客服系統完全冇後端，客戶問題無法追蹤。

**實作：**
- `GET /api/support/tickets`
- `GET /api/support/faqs`
- `POST /api/support/tickets`
- `POST /api/support/tickets/:id/messages`
- `PUT /api/support/tickets/:id`

**驗收：** Support page 可創建 ticket、可回覆、可關閉。

---

## 🟡 Phase 1 — 提升核心體驗

#### P1-A：Mobile Responsive Navigation
**原因：** 移動端流量佔比高，但導航完全崩壞。

**實作：**
- Hamburger menu + full-screen overlay
- Breakpoint: 768px
- Menu items: Home, Products, Cart (badge), Wishlist, Orders, Support, Admin (if admin)

**驗收：** iPhone 11 / Android 上所有頁面正常導航。

---

#### P1-B：User Auth + Account Pages
**原因：** 客戶需要跨 session 保存 wishlist、order history、address。

**實作：**
- `POST /api/auth/register` — email + bcrypt password
- `POST /api/auth/login` — JWT token
- `GET /api/auth/me` — current user
- `web/src/pages/Auth.tsx` — Login/Register
- `web/src/pages/Account.tsx` — Profile + addresses

**驗收：** 登入後 wishlist 跨 session 保存，order history 可見。

---

#### P1-C：Wishlist Feature
**原因：** 依附 auth，但係高價值功能。

**實作：**
- Heart icon on ProductCard (top-right)
- `web/src/pages/Wishlist.tsx` — saved items grid
- localStorage → server sync on login
- Unsaved heart for guests

**驗收：** 登入後 wishlist items 唔見得，logout 後喺返。

---

## 🔵 Phase 2 — 商業化功能

#### P2-A：Enhanced Admin Product Form
**原因：** Admin 目前只能靠 POST request 管理 product，好易錯。

**實作：**
- Drag-and-drop image upload → Cloudinary
- Brand autocomplete
- Bulk CSV import
- Multi-image gallery reorder
- Duplicate product button

**驗收：** Admin 可以喺瀏覽器上完整管理 product，唔使 postman。

---

#### P2-B：Price Filter + Stock Badge
**原因：** 客戶需要按價格篩選，知道有冇貨。

**實作：**
- Min/max price input in product list filter
- Stock badge on ProductCard: ✅ / ⚠️ X left / ❌ Out of Stock

**驗收：** 客戶可以按價格範圍篩選，見到 stock status。

---

## ⚪ Phase 3 — 未來功能（暫不做）

以下功能需要有稳定用户群先考慮：

- Returns & Refunds flow
- Real courier tracking integration
- Multi-seller marketplace
- Blog / editorial content
- Push notifications

---

## 實作順序圖

```
P0-A: SQLite setup (foundation — all P0 depend on this)
  ├── P0-B: Finance API
  ├── P0-C: Inventory API
  └── P0-D: Support API
      │
      ├── P1-A: Mobile Nav (唔依賴 auth，好快做完)
      │
      └── P1-B: User Auth
            └── P1-C: Wishlist
      │
      └── P2-A: Enhanced Admin Form
      └── P2-B: Price Filter + Stock Badge
```

---

## Codex 實作提示

### SQLite 接入策略
- 用 `better-sqlite3` synchronous API（唔需要 async wrapper）
- 每个 route handler 保持 synchronous
- Transaction for multi-table writes（inventory inbound + finance record）
- Migrations folder 內每個 .sql 檔案順序執行

### API Route 結構
每個 route file 遵循一致 pattern：
```typescript
// GET /api/resource
// GET /api/resource/:id
// POST /api/resource
// PUT /api/resource/:id
// DELETE /api/resource/:id
// GET /api/resource/stats (if applicable)
// GET /api/resource/alerts (if applicable)
```

### 錯誤處理
```typescript
res.status(400).json({ error: 'validation message' })
res.status(404).json({ error: 'not found' })
res.status(500).json({ error: 'internal error' })
```
唔好 expose SQLite 錯誤直接俾 client。

---

## 驗收命令

```bash
cd /Users/rubykan/Documents/CLOTH
npm run lint
npm run check
# After implementing:
curl http://localhost:3001/api/finance       # should return list
curl http://localhost:3001/api/inventory/alerts # should return low stock
curl http://localhost:3001/api/support/tickets  # should return list
```