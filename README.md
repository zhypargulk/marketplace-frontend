# Marketplace Frontend

Vue 3 + TypeScript frontend for the marketplace (FastAPI backend).

## Screenshots

| | |
|---|---|
| ![Screenshot 1](docs/screenshots/Screenshot%202026-03-16%20at%2003.02.24.png) | ![Screenshot 2](docs/screenshots/Screenshot%202026-03-16%20at%2003.02.33.png) |
| ![Screenshot 3](docs/screenshots/Screenshot%202026-03-16%20at%2003.02.42.png) | ![Screenshot 4](docs/screenshots/Screenshot%202026-03-16%20at%2003.03.01.png) |
| ![Screenshot 5](docs/screenshots/Screenshot%202026-03-16%20at%2003.03.11.png) | |

## Stack

- Vue 3, Vue Router
- TypeScript
- Vite
- Feature-Sliced Design (FSD): `app`, `pages`, `widgets`, `features`, `entities`, `shared`

## Clone and run

### Option 1: Run with Docker Compose (recommended)

From the **marketplace-stack** directory:

```bash
cd marketplace-stack
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:5173 (or port in `FRONTEND_PORT`).

### Option 2: Run locally

1. Node 18+ and npm:

   ```bash
   npm install
   ```

2. (Optional) API URL — create `.env.local` or `.env`:

   ```bash
   cp .env.example .env.local
   # Default: VITE_API_BASE_URL=http://localhost:8000
   ```

3. Dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173

4. Build for production:

   ```bash
   npm run build
   ```

## Project structure (FSD)

- `app/` — app layout, router
- `pages/` — route-level pages (public product list/detail, admin login/products/offers)
- `widgets/` — composite UI (e.g. AppHeader)
- `features/` — user-facing features (e.g. auth)
- `entities/` — business entities (product, offer types)
- `shared/` — config, API client, shared code
