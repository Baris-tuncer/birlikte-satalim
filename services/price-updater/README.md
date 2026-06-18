# Beraber Satalim - Price Updater Service

Standalone Node.js microservice that fetches neighborhood-level real estate price data from Endeksa's API and writes it to the Supabase `neighborhood_prices` table.

This service is designed to run as a **cron job** (not a long-running server). Each execution fetches current price indices for all target neighborhoods in Kadikoy, Istanbul, then exits.

## Prerequisites

- Node.js 18+ (uses native `fetch`)
- A Supabase project with the `neighborhood_prices` table created
- (Optional) An Endeksa B2B API key

## Local Testing

```bash
cd services/price-updater
npm install
cp .env.example .env
# Fill in your keys in .env
node index.js
```

Without an Endeksa API key, the service falls back to static seed data and logs a warning.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase **service role** key (not the anon key) |
| `ENDEKSA_API_KEY` | No | Endeksa B2B API key. Without it, static fallback data is used |
| `ENDEKSA_API_URL` | No | Endeksa API base URL. Defaults to `https://api.endeksa.com/v1` |

## Railway Deployment

1. Create a new project on Railway.
2. Connect this directory as a repo (or push as a standalone repo).
3. Set environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ENDEKSA_API_KEY`.
4. Configure as a **Cron Job** with schedule: `0 4 1 * *` (runs on the 1st of every month at 04:00 UTC).
5. Railway will run `npm start` on schedule.

## Render Deployment

1. Create a new **Cron Job** on Render.
2. Connect the repo.
3. Build command: `npm install`
4. Start command: `node index.js`
5. Schedule: `0 4 1 * *`
6. Set environment variables in the Render dashboard.

## Endeksa API Key

- Register at [endeksa.com](https://endeksa.com) for B2B API access.
- API documentation: https://endeksa.com/api-docs (contact their sales team for access).
- Without an API key the service uses fallback static data so you can still test the Supabase integration.

## Cron Schedule

The default schedule `0 4 1 * *` means:
- Minute: 0
- Hour: 4 (UTC)
- Day of month: 1
- Month: every month
- Day of week: any

This runs once per month on the 1st at 04:00 UTC (07:00 Turkey time).

## Architecture

```
index.js
  -> validateEnv()          Check required env vars
  -> fetchEndeksaData()     Call Endeksa API (or fallback)
  -> upsertToSupabase()     Write rows to neighborhood_prices
  -> logSummary()           Print results and exit
```

The Endeksa integration is modular. When the real API spec becomes available, update the `fetchNeighborhoodPrice()` function in `index.js` to match the actual endpoint and response shape.
