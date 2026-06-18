// ============================================================================
// Beraber Satalim - Neighborhood Price Updater
//
// Standalone cron service that fetches real estate price indices from Endeksa
// and upserts them into the Supabase `neighborhood_prices` table.
//
// Runs once per execution, then exits.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ENDEKSA_API_KEY = process.env.ENDEKSA_API_KEY;
const ENDEKSA_API_URL =
  process.env.ENDEKSA_API_URL || "https://api.endeksa.com/v1";

const TARGET_CITY = "istanbul";
const TARGET_DISTRICT = "kadikoy";

const TARGET_NEIGHBORHOODS = [
  "Caferaga",
  "Moda",
  "Fenerbahce",
  "Goztepe",
  "Kozyatagi",
  "Bostanci",
  "Suadiye",
  "Erenkoy",
  "Caddebostan",
  "Acibadem",
  "Hasanpasa",
  "Rasimpasa",
  "Osmanaga",
  "Yeldegirmeni",
  "Fikirtepe",
];

// Display names with Turkish characters (used in logs and DB)
const NEIGHBORHOOD_DISPLAY_NAMES = {
  Caferaga: "Caferağa",
  Moda: "Moda",
  Fenerbahce: "Fenerbahçe",
  Goztepe: "Göztepe",
  Kozyatagi: "Kozyatağı",
  Bostanci: "Bostancı",
  Suadiye: "Suadiye",
  Erenkoy: "Erenköy",
  Caddebostan: "Caddebostan",
  Acibadem: "Acıbadem",
  Hasanpasa: "Hasanpaşa",
  Rasimpasa: "Rasimpaşa",
  Osmanaga: "Osmanağa",
  Yeldegirmeni: "Yeldeğirmeni",
  Fikirtepe: "Fikirtepe",
};

const PROPERTY_TYPES = ["residential", "commercial"];

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;
const RATE_LIMIT_DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// Fallback static data (used when Endeksa API is unavailable)
// ---------------------------------------------------------------------------

const FALLBACK_PRICES = {
  Caferaga: { residential: 42000, commercial: 38000 },
  Moda: { residential: 55000, commercial: 48000 },
  Fenerbahce: { residential: 50000, commercial: 44000 },
  Goztepe: { residential: 35000, commercial: 30000 },
  Kozyatagi: { residential: 38000, commercial: 42000 },
  Bostanci: { residential: 40000, commercial: 35000 },
  Suadiye: { residential: 52000, commercial: 45000 },
  Erenkoy: { residential: 45000, commercial: 38000 },
  Caddebostan: { residential: 58000, commercial: 50000 },
  Acibadem: { residential: 33000, commercial: 28000 },
  Hasanpasa: { residential: 30000, commercial: 25000 },
  Rasimpasa: { residential: 32000, commercial: 27000 },
  Osmanaga: { residential: 36000, commercial: 32000 },
  Yeldegirmeni: { residential: 28000, commercial: 24000 },
  Fikirtepe: { residential: 34000, commercial: 30000 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timestamp() {
  return new Date().toISOString();
}

function log(message) {
  console.log(`[${timestamp()}] ${message}`);
}

function logError(message) {
  console.error(`[${timestamp()}] ERROR: ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

function validateEnv() {
  const missing = [];

  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_KEY) missing.push("SUPABASE_SERVICE_KEY");

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(", ")}`);
    logError(
      "Copy .env.example to .env and fill in the values, or set them in your deployment platform."
    );
    process.exit(1);
  }

  if (!ENDEKSA_API_KEY) {
    log(
      "WARNING: ENDEKSA_API_KEY is not set. Will use fallback static price data."
    );
  }
}

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Endeksa API integration
// ---------------------------------------------------------------------------

/**
 * Fetch price data for a single neighborhood from the Endeksa API.
 *
 * This function is intentionally modular so the endpoint URL and response
 * parsing can be updated when the real Endeksa API documentation is available.
 *
 * Expected response shape (assumed):
 * {
 *   "neighborhood": "Caferaga",
 *   "district": "Kadikoy",
 *   "city": "Istanbul",
 *   "indices": {
 *     "residential": { "avg_price_per_sqm": 42000 },
 *     "commercial": { "avg_price_per_sqm": 38000 }
 *   }
 * }
 */
async function fetchNeighborhoodPrice(neighborhoodKey) {
  const url = `${ENDEKSA_API_URL}/indices/neighborhood?city=${TARGET_CITY}&district=${TARGET_DISTRICT}&neighborhood=${encodeURIComponent(neighborhoodKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ENDEKSA_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Endeksa API returned ${response.status} ${response.statusText}: ${body}`
    );
  }

  const data = await response.json();

  // Validate the response has the expected structure
  if (!data || !data.indices) {
    throw new Error(
      `Unexpected Endeksa response shape: missing "indices" field`
    );
  }

  const result = {};

  for (const type of PROPERTY_TYPES) {
    if (data.indices[type] && typeof data.indices[type].avg_price_per_sqm === "number") {
      result[type] = data.indices[type].avg_price_per_sqm;
    } else {
      log(
        `  Warning: No ${type} price data for ${NEIGHBORHOOD_DISPLAY_NAMES[neighborhoodKey]}`
      );
      result[type] = null;
    }
  }

  return result;
}

/**
 * Fetch price data with retry logic and exponential backoff.
 */
async function fetchWithRetry(neighborhoodKey) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchNeighborhoodPrice(neighborhoodKey);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        log(
          `  Retry ${attempt}/${MAX_RETRIES} for ${NEIGHBORHOOD_DISPLAY_NAMES[neighborhoodKey]} in ${delay}ms...`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Get fallback static prices for a neighborhood.
 */
function getFallbackPrices(neighborhoodKey) {
  const prices = FALLBACK_PRICES[neighborhoodKey];
  if (!prices) {
    return null;
  }
  return { ...prices };
}

/**
 * Fetch price data for all target neighborhoods.
 *
 * Returns an array of objects:
 * [{ neighborhoodKey, displayName, prices: { residential, commercial }, source }]
 */
async function fetchAllPrices() {
  const useApi = Boolean(ENDEKSA_API_KEY);
  const results = [];

  for (const neighborhoodKey of TARGET_NEIGHBORHOODS) {
    const displayName = NEIGHBORHOOD_DISPLAY_NAMES[neighborhoodKey];

    if (useApi) {
      try {
        const prices = await fetchWithRetry(neighborhoodKey);
        results.push({
          neighborhoodKey,
          displayName,
          prices,
          source: "endeksa",
        });
        log(`  OK: ${displayName} (Endeksa API)`);
      } catch (error) {
        logError(
          `  Failed to fetch ${displayName} from Endeksa after ${MAX_RETRIES} retries: ${error.message}`
        );

        // Fall back to static data for this neighborhood
        const fallback = getFallbackPrices(neighborhoodKey);
        if (fallback) {
          results.push({
            neighborhoodKey,
            displayName,
            prices: fallback,
            source: "fallback",
          });
          log(`  FALLBACK: ${displayName} (using static data)`);
        } else {
          results.push({
            neighborhoodKey,
            displayName,
            prices: null,
            source: "failed",
          });
          log(`  SKIP: ${displayName} (no data available)`);
        }
      }

      // Rate limiting: wait between API requests
      await sleep(RATE_LIMIT_DELAY_MS);
    } else {
      // No API key — use fallback for all neighborhoods
      const fallback = getFallbackPrices(neighborhoodKey);
      if (fallback) {
        results.push({
          neighborhoodKey,
          displayName,
          prices: fallback,
          source: "fallback",
        });
        log(`  FALLBACK: ${displayName} (static data)`);
      } else {
        results.push({
          neighborhoodKey,
          displayName,
          prices: null,
          source: "failed",
        });
        log(`  SKIP: ${displayName} (no fallback data)`);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Supabase upsert
// ---------------------------------------------------------------------------

/**
 * Upsert price data into the `neighborhood_prices` table.
 *
 * Each neighborhood produces two rows (one per property_type).
 * Uses the unique constraint on (district, neighborhood, property_type).
 */
async function upsertToSupabase(supabase, priceResults) {
  const rows = [];

  for (const result of priceResults) {
    if (!result.prices) continue;

    for (const propertyType of PROPERTY_TYPES) {
      const price = result.prices[propertyType];
      if (price === null || price === undefined) continue;

      rows.push({
        city: "Istanbul",
        district: "Kadikoy",
        neighborhood: result.displayName,
        property_type: propertyType,
        avg_price_per_sqm: price,
        data_source: result.source === "endeksa" ? "endeksa" : "static_fallback",
        updated_by: null,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (rows.length === 0) {
    log("No rows to upsert.");
    return { updated: 0, failed: 0 };
  }

  log(`Upserting ${rows.length} rows to Supabase...`);

  // Upsert in batches to avoid oversized payloads (though 30 rows is fine)
  const BATCH_SIZE = 50;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from("neighborhood_prices")
      .upsert(batch, {
        onConflict: "district,neighborhood,property_type",
        ignoreDuplicates: false,
      });

    if (error) {
      logError(`Supabase upsert error (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${error.message}`);
      failed += batch.length;
    } else {
      updated += batch.length;
    }
  }

  return { updated, failed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const startTime = Date.now();

  log("==============================================");
  log("Beraber Satalim - Price Updater");
  log("==============================================");
  log(`Target: ${TARGET_CITY} / ${TARGET_DISTRICT}`);
  log(`Neighborhoods: ${TARGET_NEIGHBORHOODS.length}`);
  log(`API mode: ${ENDEKSA_API_KEY ? "Endeksa API" : "Static fallback"}`);
  log("----------------------------------------------");

  // 1. Validate environment
  validateEnv();

  // 2. Initialize Supabase
  let supabase;
  try {
    supabase = createSupabaseClient();
    // Quick health check: try to read from the table
    const { error } = await supabase
      .from("neighborhood_prices")
      .select("id")
      .limit(1);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    log("Supabase connection: OK");
  } catch (error) {
    logError(`Cannot connect to Supabase: ${error.message}`);
    logError("Exiting.");
    process.exit(1);
  }

  // 3. Fetch price data
  log("----------------------------------------------");
  log("Fetching neighborhood prices...");
  log("");

  let priceResults;
  try {
    priceResults = await fetchAllPrices();
  } catch (error) {
    logError(`Unexpected error fetching prices: ${error.message}`);
    process.exit(1);
  }

  // 4. Upsert to Supabase
  log("");
  log("----------------------------------------------");

  let upsertResult;
  try {
    upsertResult = await upsertToSupabase(supabase, priceResults);
  } catch (error) {
    logError(`Unexpected error during upsert: ${error.message}`);
    process.exit(1);
  }

  // 5. Summary
  const endTime = Date.now();
  const durationSec = ((endTime - startTime) / 1000).toFixed(1);

  const successCount = priceResults.filter((r) => r.source !== "failed").length;
  const failedCount = priceResults.filter((r) => r.source === "failed").length;
  const fallbackCount = priceResults.filter(
    (r) => r.source === "fallback"
  ).length;
  const apiCount = priceResults.filter((r) => r.source === "endeksa").length;

  log("");
  log("==============================================");
  log("SUMMARY");
  log("==============================================");
  log(`Total neighborhoods:    ${TARGET_NEIGHBORHOODS.length}`);
  log(`From Endeksa API:       ${apiCount}`);
  log(`From fallback data:     ${fallbackCount}`);
  log(`Failed (no data):       ${failedCount}`);
  log(`DB rows upserted:       ${upsertResult.updated}`);
  log(`DB rows failed:         ${upsertResult.failed}`);
  log(`Duration:               ${durationSec}s`);
  log("==============================================");

  if (upsertResult.failed > 0 || failedCount > 0) {
    log("Completed with warnings. Check errors above.");
  } else {
    log("Completed successfully.");
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main().catch((error) => {
  logError(`Unhandled error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
