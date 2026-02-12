# Clothing Brand - Monorepo

This repo contains:
- `backend/` Node.js + Express API
- `frontend/` Vite + React SPA

## Docker Images

### Image Names (Docker Hub)
The GitHub Action publishes to:
- `${DOCKERHUB_USERNAME}/clothing-brand-backend`
- `${DOCKERHUB_USERNAME}/clothing-brand-frontend`

Tags:
- `sha-<short>` on every push build
- `vX.Y.Z` and `latest` on tag pushes (`v*`)

### Backend (API) Container

**Required env**
- `MONGO_URI`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`

**Optional env (defaults shown)**
- `PORT=4000`
- `NODE_ENV=production`
- `CORS_ORIGIN=` (empty = allow only non-production origins)
- `LOG_LEVEL=info`
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

**Run example**
```bash
docker run -d --name clothing-backend -p 4000:4000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb://host.docker.internal:27017/clothing_brand" \
  -e JWT_SECRET="change-me" \
  -e REFRESH_TOKEN_SECRET="change-me-too" \
  -e CORS_ORIGIN="http://localhost:8080" \
  ${DOCKERHUB_USERNAME}/clothing-brand-backend:sha-<short>
```

### Frontend (SPA) Container

The frontend image is built with a **build-time** API URL:

**Build arg**
- `VITE_API_URL` (default `http://localhost:4000`)

**Run example**
```bash
docker run -d --name clothing-frontend -p 8080:80 \
  ${DOCKERHUB_USERNAME}/clothing-brand-frontend:sha-<short>
```

To point the frontend at a different API, pass `VITE_API_URL` during build (the GitHub Action can use `VITE_API_URL` secret):
```bash
docker build -t clothing-brand-frontend:local \
  --build-arg VITE_API_URL="https://api.example.com" \
  ./frontend
```

## GitHub Actions (CI/CD)
The workflow builds and pushes Docker images **only when files inside** `backend/` or `frontend/` change, or on `v*` tags.

**Required secrets**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `VITE_API_URL` (optional, used for frontend build)
