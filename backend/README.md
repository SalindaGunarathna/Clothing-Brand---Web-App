# Clothing Brand Backend (API)

Express + MongoDB API for the Clothing Brand app. Built for clarity, maintainability, and easy extension.

**Tech Stack**
- Node.js + Express
- MongoDB + Mongoose
- JWT auth with refresh token rotation
- express-validator for request validation
- Pino for structured logging
- Nodemailer for order emails
- Rate limiting + Helmet security headers

**Key Features**
- Auth (register, login, refresh, logout, profile)
- Products catalog with search, filters, pagination
- Cart management (user + guest carts)
- Orders with transaction-safe checkout
- Admin portal endpoints (products, orders, status updates)
- Webhook on order status change

**Local Setup**
1. Copy env file:
```bash
cp .env.example .env
```
2. Install dependencies and run:
```bash
npm install
npm run dev
```
3. Health check:
```bash
curl http://localhost:4000/health
```

**Environment Variables**
Required:
- `MONGO_URI`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`

Optional:
- `PORT=4000`
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:5173`
- `LOG_LEVEL=debug`
- `JWT_EXPIRES_IN=1d`
- `REFRESH_TOKEN_EXPIRES_IN=7d`
- `RESET_PASSWORD_EXPIRES_IN=1h`
- `BCRYPT_SALT_ROUNDS=12`
- `MONGO_USE_TRANSACTIONS=true`
- `SMTP_HOST=`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=`
- `SMTP_PASS=`
- `EMAIL_FROM=no-reply@clothingbrand.local`
- `WEBHOOK_URL=`
- `WEBHOOK_SECRET=`
- `WEBHOOK_TIMEOUT_MS=5000`

**Docker**
Build and run locally:
```bash
docker build -t clothing-brand-backend:local .
docker run -d --name clothing-backend -p 4000:4000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb://host.docker.internal:27017/clothing_brand" \
  -e JWT_SECRET="change-me" \
  -e REFRESH_TOKEN_SECRET="change-me-too" \
  -e CORS_ORIGIN="http://localhost:8080" \
  clothing-brand-backend:local
```

**Auth Endpoints**
- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)
- `POST /api/auth/refresh` (public)
- `POST /api/auth/logout` (authenticated)
- `POST /api/auth/forgot-password` (public)
- `POST /api/auth/reset-password` (public)
- `GET /api/auth/me` (authenticated)

**Product Endpoints**
- `GET /api/products` (public)
- `GET /api/products/:id` (public)
- `POST /api/products` (admin only)
- `GET /api/products/admin/all` (admin only)
- `GET /api/products/admin/:id` (admin only)
- `PATCH /api/products/admin/:id` (admin only)
- `DELETE /api/products/admin/:id` (admin only)

**Cart Endpoints**
- `GET /api/cart` (authenticated or guest)
- `GET /api/cart/total`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`
- `GET /api/cart/me` (authenticated)

**Order Endpoints**
- `POST /api/orders/checkout` (authenticated, optional `email`)
- `GET /api/orders` (authenticated)
- `GET /api/orders/:id` (authenticated)
- `GET /api/orders/admin/all` (admin only)
- `PATCH /api/orders/admin/:id/status` (admin only)

**Notes**
- Checkout uses MongoDB transactions when `MONGO_USE_TRANSACTIONS=true`.
- If SMTP is not configured in non-production, emails fall back to Ethereal.
- Admin role is required for admin endpoints.
- Routes, controllers, services, and validators are separated to keep the codebase extensible.
