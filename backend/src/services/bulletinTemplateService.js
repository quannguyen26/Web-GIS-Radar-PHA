import poolApp from "../../libs/dbWebApp.js";

/** The active template for an organization type, or null if there is none. */
export const findActiveTemplate = async (organizationType) => {
  const result = await poolApp.query(
    `SELECT id, code, version, name, organization_type, fields
     FROM bulletin_templates
     WHERE organization_type = $1 AND active`,
    [organizationType],
  );
  return result.rows[0] ?? null;
};
