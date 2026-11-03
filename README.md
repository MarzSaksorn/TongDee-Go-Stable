# Thong Dee Go — ทองดีโก

An AI-powered tourism companion for Phichai district (อำเภอพิชัย), Uttaradit, Thailand. A mobile-first web app that helps travelers explore a Thai secondary city: chat with an AI travel buddy, plan trips, navigate the map, collect digital passport stamps, and shop local OTOP products.

## Features

- **AI Travel Buddy** — chat with "Thong Dee Go Buddy", a Gemini-powered guide grounded in curated data about Phichai's attractions and local food. Thai-first conversation, with Thai/English UI.
- **AI Trip Planner** — generate a personalized day plan (half-day, 1-day, or 2-day) from your interests, pace, and starting point, then start it as an active trip.
- **Interactive Map** — Google Maps with attraction and accommodation markers, place detail previews, and directions links.
- **Digital Passport** — check in at places via GPS or QR stamp to collect stamps, earn badges, and level up.
- **Safety Mode** — SOS access and location awareness during a trip.
- **Local Taxi** — browse local taxi providers; providers can register their service.
- **OTOP Marketplace** — browse and buy local community products; sellers can register shops and manage them from a dashboard.
- **Accommodations** — browse hotels and guesthouses with amenities, room types, and booking links; owners can register properties for admin review.
- **Travel Diary** — a journal of the places you have visited.
- **Weather** — current conditions and hourly forecast for Phichai.
- **Guest mode** — every feature works without an account: check-ins, stamps, and badges persist to the device (localStorage) and migrate automatically to your account when you sign in.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, GSAP + Motion |
| Backend | Express 4 (single `server.ts`), Google Gemini (`@google/genai`), Google Weather API |
| Data & Auth | Supabase (Postgres + Auth), anon-key client |
| Maps | `@vis.gl/react-google-maps` |
| i18n / Theming | TH/EN via `LanguageContext`; accent themes, UI scale, and dark mode via `AppearanceContext` |

## Getting Started
Prerequisites: Node.js 22 or newer.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file from the template and fill in the keys:

   ```bash
   cp .env.example .env
   ```

   At minimum, set `GEMINI_API_KEY` (AI buddy + trip planner) and the two `VITE_SUPABASE_*` values. The app still runs without them: attraction and accommodation data falls back to the bundled seed content, and the chat buddy falls back to an offline responder.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3002. The Express server serves the Vite app in middleware mode, so the API routes (`/api/chat`, `/api/trip-planner/generate`, `/api/weather/home`) work out of the box — no separate frontend and backend processes.

## Run with Docker Compose

Requirements: Docker Engine with the Compose plugin.

```bash
cp .env.example .env
# Set any optional API keys in .env, then build and start the app.
docker compose up --build -d
```

Open <http://localhost:3002>. Compose binds to `127.0.0.1` by default. Set `HOST_PORT` in `.env` to use a different local port. Check status and logs with `docker compose ps` and `docker compose logs -f tongdee-go`. The health endpoint is `GET /health`.

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `GOOGLE_MAPS_PLATFORM_KEY` are supplied at image build time because Vite embeds them in client assets. These are browser-visible settings; never use a Supabase service-role key here. `GEMINI_API_KEY` and `GOOGLE_WEATHER_API_KEY` remain runtime-only server settings. The app doesn't need a local data volume because its persistent user data is handled by Supabase and browser storage.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | For AI features | Gemini model access for the travel buddy and trip planner (read server-side) |
| `VITE_SUPABASE_URL` | For auth/data | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For auth/data | Supabase anon (publishable) key |
| `GOOGLE_WEATHER_API_KEY` | No | Google Weather API key for `/api/weather/home` |
| `VITE_HOME_WEATHER_LAT` / `VITE_HOME_WEATHER_LNG` / `VITE_HOME_WEATHER_LOCATION_NAME` | No | Fallback weather location (defaults to Phichai) |
| `GOOGLE_MAPS_PLATFORM_KEY` | No | Injected into the client bundle for Maps via Vite `define` |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Express + Vite middleware) on port 3002 |
| `npm run build` | Build the frontend to `dist/` and bundle the server to `dist/server.cjs` |
| `npm start` | Run the production server (`node dist/server.cjs`) |
| `npm run lint` | Type-check the project (`tsc --noEmit`) |
| `npm run clean` | Remove the `dist/` directory |

## Architecture

The app is a single-page mobile-style shell that widens with the display — a 480px column on phones, 560px on tablets, 720px on desktop, adapting to landscape orientation (`.app-shell` in `src/index.css`) — with a custom integer screen router in `src/App.tsx`: navigation is a `currentScreen` state (screens 1–40) persisted to sessionStorage, with a back-history stack. react-router is not used at runtime.

- `src/components/*View.tsx` — one view component per screen; shared UI in `src/components/shared/` and shadcn primitives in `components/ui/`.
- `src/data.ts` — seed content: attractions, OTOP food, stamps, badges, the default itinerary, and accommodations.
- `src/services/` — Supabase fetchers that map DB rows to the `src/types.ts` shapes and fall back to `src/data.ts` on error or empty results.
- `server.ts` — the only backend file: Gemini chat, trip-plan generation, and the Google Weather proxy. `api/weather/home.ts` is a Vercel serverless equivalent.
- `src/i18n/` and `src/theme/` — context providers for language (TH/EN) and appearance (accent color, UI scale, dark mode), persisted per user in the Supabase `user_settings` table.

## Deployment

The project is Vercel-compatible: `npm run build` produces the static frontend plus the server bundle, and `api/` holds serverless functions. Set the environment variables above in your hosting provider.
