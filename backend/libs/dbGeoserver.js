import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_GEO_NAME,
  password: process.env.DB_PASSWD,
  port: process.env.DB_PORT,
});

// Errors on idle clients are recoverable: the pool discards the broken client.
// Log instead of exiting so a transient DB hiccup does not kill the server.
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err.message);
});

export default pool;

//
