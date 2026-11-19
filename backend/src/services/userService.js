import poolApp from "../../libs/dbWebApp.js";

// Base query: user joined with role, organization and title lookups
const USER_DETAILS_SELECT = `
  SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.phone,
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
});

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
