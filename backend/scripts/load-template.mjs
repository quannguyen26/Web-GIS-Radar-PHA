// Load a bulletin template (fields.json) into the bulletin_templates table.
// Run from the backend folder (so .env is found):
//   node scripts/load-template.mjs templates/radar-station/fields.json
import fs from "node:fs";
import pool from "../libs/dbWebApp.js";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/load-template.mjs <path to fields.json>");
  process.exit(1);
}

const template = JSON.parse(fs.readFileSync(filePath, "utf8"));
const { templateCode, name, organizationType, version, fields } = template;
if (!templateCode || !name || !organizationType ||
    !Number.isInteger(version) || !Array.isArray(fields)) {
  console.error("Missing templateCode, name, organizationType, version or fields");
  process.exit(1);
}

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "UPDATE bulletin_templates SET active = false WHERE organization_type = $1 AND active",
    [organizationType],
  );
  const { rows } = await client.query(
    `INSERT INTO bulletin_templates (code, version, name, organization_type, fields)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [templateCode, version, name, organizationType, JSON.stringify(fields)],
  );
  await client.query("COMMIT");
  console.log(`Loaded ${templateCode} v${version} (id ${rows[0].id}, ${fields.length} fields)`);
} catch (err) {
  await client.query("ROLLBACK");
  if (err.code === "23505") console.error(`${templateCode} v${version} already exists`);
  else console.error("Load failed:", err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
