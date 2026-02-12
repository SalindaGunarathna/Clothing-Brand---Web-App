# Clothing Brand Frontend (SPA)

Vite + React single-page app for the Clothing Brand store and admin portal.

**Tech Stack**
- Vite + React
- TypeScript
- Redux Toolkit
- Tailwind CSS
- React Router

**Key Features**
- Product listing with filters and sorting
- Product details + cart
- Checkout flow and order history
- Admin dashboard for products and orders

**Local Setup**
1. Copy env file:
```bash
cp .env.example .env
```
2. Install and run:
```bash
npm install
npm run dev
```
3. Open:
```text
http://localhost:5173
```

**Environment Variables**
Required:
- `VITE_API_URL` (example: `http://localhost:4000`)

**Docker**
The frontend image is built with a build-time API URL.

Build locally:
```bash
docker build -t clothing-brand-frontend:local \
  --build-arg VITE_API_URL="http://localhost:4000" \
  .
```

Run:
```bash
docker run -d --name clothing-frontend -p 8080:80 \
  clothing-brand-frontend:local
```

**Notes**
- The product image upload flow is not implemented; admins provide an image URL.
- For production, set `VITE_API_URL` to your API base URL.
- UI components and Redux state are organized for reuse and maintainability.
