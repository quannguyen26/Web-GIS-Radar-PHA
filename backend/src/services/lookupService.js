import poolApp from "../../libs/dbWebApp.js";

/** Roles whose code is in `codes` (e.g. ["ADMIN", "USER"]). */
export const listRolesByCodes = async (codes) => {
  const result = await poolApp.query(
    "SELECT id, code, name FROM roles WHERE code = ANY($1::text[]) ORDER BY id",
    [codes],
  );
  return result.rows;
};

/** Every title (QTV, DBV, ...). */
export const listTitles = async () => {
  const result = await poolApp.query(
    "SELECT id, code, name FROM titles ORDER BY id",
  );
  return result.rows;
};

/**
 * Active organizations. organizationId = null → all of them,
 * otherwise only that one (ADMIN sees only their own organization).
 */
export const listOrganizations = async ({ organizationId = null } = {}) => {
  const where =
    organizationId == null
      ? "WHERE active IS NOT FALSE"
      : "WHERE active IS NOT FALSE AND id = $1";
  const params = organizationId == null ? [] : [organizationId];

  const result = await poolApp.query(
    `SELECT id, code, name, organization_type
     FROM organizations
     ${where}
     ORDER BY id`,
    params,
  );
  return result.rows;
};
