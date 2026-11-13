import crypto from "crypto";
import poolGeo from "../../libs/dbGeoserver.js";
import initPostgresListener from "../../libs/initPostgresListener.js";
import dotenv from "dotenv";

dotenv.config();

// Whitelist of radar products -> mosaic index tables.
// Table names are never built from user input (prevents SQL injection).
export const PRODUCT_TABLES = {
  MAX: "max_mosaic_index",
  HMAX: "hmax_mosaic_index",
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const HEARTBEAT_INTERVAL_MS = 25_000;

// Number of timestamps sent on connect, read once from env and clamped to [1, MAX_LIMIT]
const parsedLimit = Number.parseInt(process.env.LIMIT_PRODUCTS, 10);
const TIMESTAMP_LIMIT = Number.isFinite(parsedLimit)
  ? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
  : DEFAULT_LIMIT;

// SSE clients grouped by product: { MAX: [{ id, res }], HMAX: [...] }
const productGroups = {};

// Return the latest `limit` ingestion timestamps (ascending order is applied by the caller)
const getLatestTimestamps = async (product, limit) => {
  const tableName = PRODUCT_TABLES[product];
  if (!tableName) {
    throw new Error(`Unknown product: ${product}`);
  }

  const result = await poolGeo.query(
    `SELECT ingestion::text FROM ${tableName} ORDER BY ingestion DESC LIMIT $1`,
    [limit],
  );
  return result.rows.map((row) => {
    const rawDate = row.ingestion.substring(0, 19);
    return `${rawDate.replace(" ", "T")}Z`;
  });
};

// SSE endpoint: GET /api/time?product=MAX
// Sends the latest timestamps on connect, then pushes new ones via the Postgres listener.
export const getTimes = async (req, res) => {
  const { product } = req.query;

  if (typeof product !== "string" || !PRODUCT_TABLES[product]) {
    return res.status(400).json({ message: "Tham số product không hợp lệ" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Send the initial timestamps before registering the client, so a new
  // timestamp can never be pushed ahead of the initial list.
  try {
    const initTimes = await getLatestTimestamps(product, TIMESTAMP_LIMIT);
    res.write(
      `data: ${JSON.stringify({
        timestamps: initTimes.reverse(),
        limit: TIMESTAMP_LIMIT,
      })}\n\n`,
    );
  } catch (err) {
    console.error("Failed to load initial timestamps:", err);
    // End the stream so the browser's EventSource retries the connection
    return res.end();
  }

  // The client may have disconnected while the query was running
  if (res.writableEnded || req.socket.destroyed) return;

  const clientId = crypto.randomUUID();
  if (!productGroups[product]) productGroups[product] = [];
  productGroups[product].push({ id: clientId, res });

  // Comment lines keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(": ping\n\n");
  }, HEARTBEAT_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    const remaining = (productGroups[product] || []).filter(
      (c) => c.id !== clientId,
    );
    if (remaining.length > 0) {
      productGroups[product] = remaining;
    } else {
      delete productGroups[product];
    }
  });
};

// Listen to Postgres notifications and dispatch to the matching product group
initPostgresListener(productGroups, getLatestTimestamps, PRODUCT_TABLES);
