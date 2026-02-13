# Clothing Brand Web App

Full-stack e-commerce app for a clothing brand. The repo contains a Node.js + Express API and a Vite + React SPA.
The latest changes are in the [dev branch](https://github.com/SalindaGunarathna/Clothing-Brand---Web-App/tree/dev).

**Repository Structure**
- `backend/` API (Express + MongoDB)
- `frontend/` SPA (Vite + React)

**Core Features**
- Product browsing with search, filters, and sorting
- Product detail view and cart management
- Checkout and order history
- Admin portal for products and orders
- Role-based access control
- Order status updates and email notifications

**Run Locally**
1. Clone the repo.
2. Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
3. Frontend:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
4. Open the app at `http://localhost:5173`.

**Run with Docker**
Images are built via GitHub Actions and pushed to Docker Hub. You can run them locally like this:
```bash
docker run -d --name clothing-backend -p 4000:4000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb://host.docker.internal:27017/clothing_brand" \
  -e JWT_SECRET="change-me" \
  -e REFRESH_TOKEN_SECRET="change-me-too" \
  -e CORS_ORIGIN="http://localhost:8080" \
  salindadocker/clothing-brand-backend:v<run_number>
```

```bash
docker run -d --name clothing-frontend -p 8080:80 \
  salindadocker/clothing-brand-frontend:v<run_number>
```

**Image Tags**
- `v<run_number>` on normal pushes (example: `v42`)
- `vX.Y.Z` on tag pushes (`v*`)

For full Docker and environment details, see `backend/README.md` and `frontend/README.md`.
salindadocker/clothing-brand-frontend
salindadocker/clothing-brand-backend
bothe images are avlible on public so check the tag and get lates one 

**Default Seed Credentials**
- Admin: `admin@clothingbrand.local` / `Admin123!`
- User: `user@clothingbrand.local` / `User123!`

**Submission Expectations**
- This README includes setup steps for local run and Docker images.
- Repo is ready to share as a link or ZIP.
- Credentials and required config are listed above and in each service README.
- Known gap (not implemented): direct image upload for products. The admin currently provides an image URL. Planned approach: upload to storage (e.g., S3/Cloudinary) from the frontend, then store the returned URL.
