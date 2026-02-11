# Clothing Brand Backend

Feature 1: User Accounts & Authentication (Express + MongoDB)

## Setup
1) Copy `.env.example` to `.env` and update values.
2) Install dependencies: `npm install`
3) Start dev server: `npm run dev`

## Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- GET `/api/auth/me` (protected)
---
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products` (admin only)
--
- GET `/api/cart`
- GET `/api/cart/total`
- POST `/api/cart/items`
- PATCH `/api/cart/items/:itemId`
- DELETE `/api/cart/items/:itemId`
- DELETE `/api/cart`
- GET `/api/cart/me` (authenticated)
---
- POST `/api/orders/checkout` (authenticated)
- GET `/api/orders` (authenticated)
- GET `/api/orders/:id` (authenticated)
- GET `/api/orders/admin/all` (admin only)
- PATCH `/api/orders/admin/:id/status` (admin only)
---
- GET `/health`

## Notes
- User roles are stored as uppercase enums: `USER`, `ADMIN`.
- Refresh tokens are rotated on each `/refresh` call and persisted in MongoDB.
- Refresh tokens are revoked on rotation/logout and automatically cleaned up by a TTL index on `expiresAt`.
- In non-production, `/forgot-password` returns a `resetToken` for testing.
- MongoDB transactions require a replica set. For local standalone MongoDB, set `MONGO_USE_TRANSACTIONS=false`.
- Request validation uses express-validator to keep the setup lightweight for this project.

## Product Seeding
- Run `npm run seed:products` to insert sample products.
- Set `SEED_FORCE=true` to delete existing products before seeding.

## Product Query Params
- `search`: text search on name/description
- `category`: MEN | WOMEN | KIDS
- `size`: S | M | L | XL
- `minPrice`, `maxPrice`
- `page`, `limit` (pagination)
- `sort`: price | -price | createdAt | -createdAt | name | -name
 - Default sort: `-createdAt` (newest first). If `search` is used and `sort` is not provided, results are sorted by relevance then newest.

## Stock Notes
- Optional per-size stock is supported via `stockBySize` in products.
- Cart add/update checks stock if `stockBySize` is present.

## Cart Notes
- Guests can use the cart by sending `x-guest-id` header (or `guestId` in body/query).
- If no guest id is provided, the API will create one and return it in the response.
- On login/register, sending `x-guest-id` will merge the guest cart into the user cart.

## Email (Nodemailer)
- Configure SMTP via `.env`:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- In non-production, if SMTP is not set, Ethereal test account is used and a preview URL is logged.

## Checkout Notes
- `POST /api/orders/checkout` supports optional `itemIds` to order only selected cart items.

## Admin Order Filters
- `GET /api/orders/admin/all` supports:
  - `status` (PLACED | PROCESSING | SHIPPED | DELIVERED | CANCELLED)
  - `startDate` / `endDate` (ISO 8601)
  - `page`, `limit` (pagination)

## Webhook (Order Status)
- Optional webhook on status change:
  - `WEBHOOK_URL`, `WEBHOOK_SECRET`, `WEBHOOK_TIMEOUT_MS`


## Default seed credentials (change in env if you want)

Admin: admin@clothingbrand.local / Admin123!
User: user@clothingbrand.local / User123!
