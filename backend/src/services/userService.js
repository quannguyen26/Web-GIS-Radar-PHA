import poolApp from "../../libs/dbWebApp.js";

// Base query: user joined with role, organization and title lookups
const USER_DETAILS_SELECT = `
  SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.phone,
         u.active, u.last_login,
         t.id AS title_id, t.name AS title_name,
         r.id AS role_id, r.code AS role_code, r.name AS role_name,
         o.id AS organization_id, o.name AS organization_name,
         o.organization_type
  FROM users u
  LEFT JOIN titles t ON u.title_id = t.id
  LEFT JOIN roles r ON u.role_id = r.id
  LEFT JOIN organizations o ON u.organization_id = o.id
`;

/**
 * Chuyển bản ghi user từ DB (snake_case) sang dạng trả về cho client (camelCase).
 * Không bao giờ chứa password_hash.
 */
export const toUserDTO = (row) => ({
  id: row.id,
  username: row.username,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  titleId: row.title_id,
  titleName: row.title_name,
  roleId: row.role_id,
  roleCode: row.role_code,
  roleName: row.role_name,
  organizationId: row.organization_id,
  organizationName: row.organization_name,
  // null for SYSTEM_ADMIN (no organization)
  organizationType: row.organization_type,
  active: row.active,
  lastLogin: row.last_login,
});

/** Role code ("SYSTEM_ADMIN", "ADMIN", "USER") for a role id, or null. */
export const findRoleCodeById = async (roleId) => {
  const result = await poolApp.query("SELECT code FROM roles WHERE id = $1", [
    roleId,
  ]);
  return result.rows[0]?.code ?? null;
};

// Columns that updateUserFields may write. Keys come from code, never from
// the request, but the whitelist makes that explicit.
const UPDATABLE_COLUMNS = [
  "full_name",
  "email",
  "phone",
  "title_id",
  "role_id",
  "organization_id",
];

/**
 * Update some columns of a user. `fields` maps column name → new value,
 * e.g. { full_name: "A", email: null }. Unknown columns throw an error.
 */
export const updateUserFields = async (id, fields) => {
  const columns = Object.keys(fields);
  for (const column of columns) {
    if (!UPDATABLE_COLUMNS.includes(column)) {
      throw new Error(`Column not allowed: ${column}`);
    }
  }

  // Build "full_name = $1, email = $2, ..." — values always go through $n
  const setClause = columns.map((column, i) => `${column} = $${i + 1}`);
  setClause.push("updated_at = CURRENT_TIMESTAMP");
  const values = columns.map((column) => fields[column]);

  await poolApp.query(
    `UPDATE users SET ${setClause.join(", ")} WHERE id = $${columns.length + 1}`,
    [...values, id],
  );
};

/** Lock (active = false) or unlock (active = true) a user account. */
export const setUserActive = async (id, active) => {
  await poolApp.query(
    "UPDATE users SET active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [active, id],
  );
};

/** Store a new password hash (the caller hashes with bcrypt). */
export const setUserPasswordHash = async (id, passwordHash) => {
  await poolApp.query(
    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [passwordHash, id],
  );
};

/** Log the user out everywhere: delete all their refresh-token sessions. */
export const deleteUserSessions = async (userId) => {
  await poolApp.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
};

/**
 * List users (raw rows, map with toUserDTO before sending).
 * organizationId = null → every user; otherwise only that organization.
 */
export const listUsers = async ({ organizationId = null } = {}) => {
  const where = organizationId == null ? "" : "WHERE u.organization_id = $1";
  const params = organizationId == null ? [] : [organizationId];
  const result = await poolApp.query(
    `${USER_DETAILS_SELECT} ${where} ORDER BY o.name NULLS FIRST, u.username`,
    params,
  );
  return result.rows;
};

/** Lấy bản ghi user thô (kèm password_hash) theo username — dùng cho đăng nhập. */
export const findUserByUsername = async (username) => {
  const result = await poolApp.query(
    `${USER_DETAILS_SELECT} WHERE u.username = $1`,
    [username],
  );
  return result.rows[0] || null;
};

/** Lấy bản ghi user thô (kèm password_hash) theo id. */
export const findUserById = async (id) => {
  const result = await poolApp.query(`${USER_DETAILS_SELECT} WHERE u.id = $1`, [
    id,
  ]);
  return result.rows[0] || null;
};
