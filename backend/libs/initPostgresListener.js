import poolGeo from "./dbGeoserver.js";

const CHANNEL = "radar_product_update";
const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

// Send an SSE message to every open connection in a group
const broadcast = (clients, data) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    if (client.res.writableEnded) return;
    try {
      client.res.write(message);
    } catch (err) {
      console.error(`SSE write failed for client ${client.id}:`, err.message);
    }
  });
};

/**
 * Keep a dedicated connection LISTENing on the radar channel and push new
 * timestamps to SSE clients. Reconnects with exponential backoff if the
 * connection is lost, and never lets a bad notification crash the process.
 */
const initPostgresListener = (
  productGroups,
  getLatestTimestamps,
  productTables,
) => {
  let retryDelay = INITIAL_RETRY_MS;

  const handleNotification = async (msg) => {
    if (msg.channel !== CHANNEL) return;

    try {
      const payload = JSON.parse(msg.payload);
      const targetProduct = payload?.product;

      // Ignore products outside the whitelist
      if (!productTables[targetProduct]) {
        console.warn(`Ignoring notification for unknown product:`, targetProduct);
        return;
      }

      // Only query when someone is watching this product
      const clients = productGroups[targetProduct];
      if (!clients || clients.length === 0) return;

      const latestTimeArr = await getLatestTimestamps(targetProduct, 1);
      if (latestTimeArr.length > 0) {
        broadcast(clients, { newTimestamp: latestTimeArr[0] });
      }
    } catch (err) {
      console.error("Failed to handle Postgres notification:", err);
    }
  };

  const scheduleReconnect = () => {
    console.warn(`Postgres listener reconnecting in ${retryDelay} ms...`);
    setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
  };

  const connect = async () => {
    let client;
    try {
      client = await poolGeo.connect();
      await client.query(`LISTEN ${CHANNEL}`);
    } catch (err) {
      console.error("Postgres listener failed to connect:", err.message);
      if (client) client.release(true);
      scheduleReconnect();
      return;
    }

    retryDelay = INITIAL_RETRY_MS;
    console.log(`Postgres listener is listening on "${CHANNEL}"`);

    let closed = false;
    const onLost = (err) => {
      if (closed) return;
      closed = true;
      console.error("Postgres listener connection lost:", err?.message || "ended");
      client.removeListener("notification", handleNotification);
      // Destroy the broken client instead of returning it to the pool
      client.release(true);
      scheduleReconnect();
    };

    client.on("notification", handleNotification);
    client.on("error", onLost);
    client.on("end", () => onLost());
  };

  connect();
};

export default initPostgresListener;
