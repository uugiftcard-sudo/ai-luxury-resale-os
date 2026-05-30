# CLOTH Phase 2 Contract — Filtering / Pagination

## Goal

Phase 2 只做商品列表的後端 filtering / pagination readiness。第一刀不改 UI、不改 auth、不改 finance / inventory / support route contract。

## Scope

### In scope
- `GET /api/products` query contract 固化
- 參數 validation：非法 numeric / enum query 回 400 JSON
- 商品 filtering + sorting + pagination regression tests
- SQLite-backed query path 可被後續索引優化
- 保留現有 response wrapper：`{ success: true, data: ... }`

### Out of scope
- Web UI filter panel
- Auth / account / wishlist
- Cursor pagination
- 跨 repo 改 XAU / BuyerOS
- 大型 query builder / specification pattern 抽象

## API Contract

Endpoint:

```http
GET /api/products
```

Supported query params:

| Param | Type | Default | Rules |
|---|---:|---:|---|
| `market` | `ALL \| UK \| HK \| CN` | `ALL` | `ALL` shows all shared + regional products; regional market shows `ALL` + matching market |
| `status` | `待售 \| 已售 \| 已下架` | `待售` | invalid value returns 400 |
| `brand` | string | none | exact match |
| `category` | string | none | exact match |
| `condition` | string | none | exact match against existing product condition values |
| `minPrice` | number | none | finite, `>= 0`; invalid returns 400 |
| `maxPrice` | number | none | finite, `>= 0`; invalid returns 400 |
| `search` | string | none | case-insensitive match on title / brand / description |
| `page` | number | `1` | integer, `>= 1`; invalid returns 400 |
| `limit` | number | `12` | integer, `1..50`; invalid returns 400 |
| `sort` | enum | `createdAt_desc` | supported values listed below |

Supported `sort` values:

| Value | Meaning |
|---|---|
| `createdAt_desc` | newest first |
| `createdAt_asc` | oldest first |
| `price_desc` | highest price first |
| `price_asc` | lowest price first |

Price range rule:
- If both `minPrice` and `maxPrice` are present and `minPrice > maxPrice`, return 400 JSON.

## Response Shape

Keep current wrapper and inner payload shape:

```json
{
  "success": true,
  "data": {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 12,
    "totalPages": 0
  },
  "message": "操作成功"
}
```

Do not rename inner `data` in Phase 2. It is awkward but already used by existing smoke tests.

Validation error shape:

```json
{
  "success": false,
  "error": "page 必须是大于等于 1 的整数"
}
```

## Implementation Boundary

Preferred first implementation:
- Add local query parsing helpers in `api/src/routes/products.ts` or a small module beside it.
- Keep filtering readable and explicit.
- Do not introduce a general-purpose query builder.
- Keep existing `filterProductsByMarket()` behavior unless moving the same logic into a DB-backed query helper.

SQLite readiness:
- Current persistence uses `kv_collections.value` JSON.
- Phase 2 may add a small DB query helper later, but first PR can keep route-level filtering if tests lock the contract.
- If adding indexes, use expression indexes over JSON fields and keep them in a new migration file. Never edit applied migrations.

Candidate future indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_kv_products_market
ON kv_collections(collection, json_extract(value, '$.market'));

CREATE INDEX IF NOT EXISTS idx_kv_products_status
ON kv_collections(collection, json_extract(value, '$.status'));

CREATE INDEX IF NOT EXISTS idx_kv_products_category
ON kv_collections(collection, json_extract(value, '$.category'));

CREATE INDEX IF NOT EXISTS idx_kv_products_brand
ON kv_collections(collection, json_extract(value, '$.brand'));

CREATE INDEX IF NOT EXISTS idx_kv_products_price
ON kv_collections(collection, CAST(json_extract(value, '$.price') AS REAL));

CREATE INDEX IF NOT EXISTS idx_kv_products_created_at
ON kv_collections(collection, json_extract(value, '$.createdAt'));
```

## Regression Tests

Extend `scripts/api-smoke.test.mjs` or add `scripts/products-filter-pagination.test.mjs`.

Required cases:
- `market=UK` returns shared `ALL` products plus UK products.
- `category=包袋` filters products.
- `minPrice` / `maxPrice` filters range.
- `page=2&limit=3` returns stable page and unchanged `total`.
- `sort=price_asc` and `sort=price_desc` are ordered correctly.
- `search=gucci` matches title / brand / description.
- invalid `page=abc` returns 400 JSON.
- invalid `limit=0` returns 400 JSON.
- invalid `minPrice=abc` returns 400 JSON.
- `minPrice=100&maxPrice=50` returns 400 JSON.
- invalid `status=bad` returns 400 JSON.

## Verification

```bash
cd /Users/rubykan/Documents/CLOTH
npm run check
npm run lint
node --test scripts/api-smoke.test.mjs
node --test scripts/api-validation-errors.test.mjs
node --test scripts/product-market-persistence.test.mjs
node --import tsx --test api/src/db/sqlite-store.test.ts
```

If Phase 2 adds a new products filter test, include it in the final verification list.
