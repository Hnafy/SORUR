# Admin Products Management — Design Doc

Date: 2026-09-05
Status: Approved by user

## Goal

Rewrite `src/pages/admin/AdminProducts.jsx` from mock data to the real FreeAPI.app
e-commerce product API, with full image upload/edit (main + sub-images), matching
the patterns already established by the migrated `AdminCategories.jsx` page.

## Verified FreeAPI contract (from source + live API tests)

Base: `https://api.freeapi.app/api/v1/ecommerce/products` (mounted in `app.js`).

| Operation | Method & path | Payload | Notes (verified live) |
|---|---|---|---|
| List | `GET /products` | query `page, limit` (+ public `query`, `category`) | response `{ products, totalProducts, totalPages, page, limit, hasPrevPage, hasNextPage }` |
| Create | `POST /products` | `multipart/form-data`: `name, description, category, price, stock` + `mainImage` file (required, max 1) + `subImages` files | 400 if `mainImage` missing; max 4 sub-images |
| Update | `PATCH /products/:productId` | `multipart/form-data`: same fields + optional `mainImage`, `subImages` | **`category` is required on every PATCH** (422 `Invalid category` if omitted). New sub-images are **appended** to existing ones. New `mainImage` replaces old one. |
| Delete | `DELETE /products/:productId` | — | returns `{ deletedProduct }` |
| Remove sub-image | `PATCH /products/remove/subimage/:productId/:subImageId` | — | returns updated product with the sub-image pulled |

- There is **no** "add sub-image" POST endpoint (user's original spec was inaccurate).
  Sub-images are only added via create/update multipart.
- `MAXIMUM_SUB_IMAGE_COUNT = 4` total sub-images per product (existing + new).

## Changes

### 1. `src/services/productApi.js` — add admin CRUD

Add a multipart builder and methods mirroring `categoryApi`:

- `buildProductFormData(payload)` — `FormData` with `name, description, category,
  price, stock`; appends `mainImage` if it is a `File`, appends each `File` in
  `subImages`. Never appends non-File values (URLs are kept as state, not re-uploaded).
- `createProduct(payload)` — `POST /ecommerce/products` multipart.
- `updateProduct(id, payload)` — `PATCH /ecommerce/products/:id` multipart;
  the caller must always pass `category`.
- `deleteProduct(id)` — `DELETE /ecommerce/products/:id`.
- `removeSubImage(productId, subImageId)` — `PATCH /ecommerce/products/remove/subimage/:productId/:subImageId`.
- `fetchAllCategories({ limit })` — wraps existing `GET /ecommerce/categories` to power the form dropdown.

Upload progress: axios `onUploadProgress` option accepted by `createProduct`/`updateProduct`.

### 2. `src/pages/admin/AdminProducts.jsx` — full rewrite

Mirror `AdminCategories.jsx` structure and UX.

**DataTable**
- Server pagination with `PAGE_SIZE = 10`, `page`, `totalPages`, `totalProducts`.
- Debounced (300ms) client-side search over the loaded page, filtering by product
  name OR category name (same `hasTyped` ref pattern as AdminCategories).
- Columns: صورة، الاسم، القسم، السعر (ج.م)، المخزون، إجراءات.
- Stock badge: danger when `stock <= 5`, else success.
- Row actions: **عرض** (view modal)، **تعديل** (edit)، **حذف** (delete with confirmation modal).
- Loading spinner / error + retry / empty state (same as AdminCategories).
- After every mutation (create/update/delete/remove-sub-image) re-run `load()`.

**Create/Edit modal — single-page comprehensive form**
- Fields: name, category (dropdown from real categories), price, stock, description.
- Main image: file input with `URL.createObjectURL` preview; on edit shows current
  main image + "replace" upload.
- Sub-images gallery:
  - Create: multi-select new files, max 4 total, immediate previews.
  - Edit: shows existing server sub-images each with an individual remove (✕) →
    calls `removeSubImage`; plus an "append new" file picker, total must stay ≤ 4.
- Submit:
  - Create: `mainImage` file required.
  - Edit: always send `category`; only text fields + files present in form are sent.
- Upload state: `saving` boolean + upload progress bar via `onUploadProgress`;
  form disabled during upload.
- Object URLs revoked on cleanup/unmount (`URL.revokeObjectURL`).

**Delete confirmation modal** — product name, spinner while deleting, matches AdminCategories.

## Behavior notes

- No mock imports in `AdminProducts.jsx`; `tokenHeaders()` removed (axios interceptor injects JWT).
- `mockApi.js` and `src/mocks/*` remain untouched (other 8 admin/customer pages still use them — out of scope).
- Admin-only endpoints require a real FreeAPI ADMIN JWT. The `.env` admin must be a
  currently-valid backend admin (the shared FreeAPI DB is ephemeral/reset periodically,
  so an admin may need re-registration via the Register flow). Runtime concern, no code change.

## Verification

- `npm run lint` (tsc --noEmit) passes.
- `npm run build` (vite build) passes.
- Manual: as real backend admin, create a product with main + sub images; edit fields;
  append a sub-image; remove an individual sub-image; delete product. Table refreshes and
  toasts appear after each action.