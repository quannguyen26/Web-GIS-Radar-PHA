import bcrypt from "bcrypt";
import {
  deleteUserSessions,
  findRoleCodeById,
  findUserById,
  listUsers as listUsersFromDb,
  setUserActive as setUserActiveInDb,
  setUserPasswordHash,
  toUserDTO,
  updateUserFields,
} from "../services/userService.js";
import { canAccessOrganization } from "../middleware/authMiddleware.js";

const isPositiveInteger = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Same limits as /auth/signup (bcrypt ignores bytes beyond 72)
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

/**
 * May `actor` (req.user, from the token) edit / lock / reset `target`
 * (a raw DB row)? Rules from spec section 3 (decided 2026-11-20):
 * - SYSTEM_ADMIN accounts cannot be managed through the API.
 * - SYSTEM_ADMIN manages every ADMIN and USER.
 * - ADMIN manages only USER accounts of their own organization.
 */
const canManageUser = (actor, target) => {
  if (target.role_code === "SYSTEM_ADMIN") return false;
  if (actor.roleCode === "SYSTEM_ADMIN") return true;
  if (actor.roleCode === "ADMIN") {
    return (
      target.role_code === "USER" &&
      canAccessOrganization(actor, target.organization_id)
    );
  }
  return false;
};

/**
 * Load the target user from :id and check the actor may manage them.
 * Sends the error response itself and returns null when not allowed.
 */
const loadManageableUser = async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInteger(id)) {
    res.status(400).json({ message: "id không hợp lệ" });
    return null;
  }

  const target = await findUserById(id);
  if (!target) {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
    return null;
  }

  if (!canManageUser(req.user, target)) {
    res
      .status(403)
      .json({ message: "Bạn không có quyền quản lý người dùng này" });
    return null;
  }

  return target;
};

// Controller to get profile of the currently logged-in user
export const authMe = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from decoded JWT by authMiddleware

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      user: toUserDTO(user),
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/users[?organizationId=N]
// SYSTEM_ADMIN: every user (optional organization filter).
// ADMIN: always only their own organization (query parameter is ignored).
export const listUsers = async (req, res) => {
  try {
    let organizationId = null;

    if (req.user.roleCode === "SYSTEM_ADMIN") {
      const filter = req.query.organizationId;
      if (filter !== undefined) {
        if (!isPositiveInteger(filter)) {
          return res
            .status(400)
            .json({ message: "organizationId không hợp lệ" });
        }
        organizationId = Number(filter);
      }
    } else {
      // Never trust the client: the scope comes from the signed token
      organizationId = req.user.organizationId;
    }

    const rows = await listUsersFromDb({ organizationId });
    return res.status(200).json({ users: rows.map(toUserDTO) });
  } catch (error) {
    console.error("Lỗi khi gọi listUsers", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/users/:id
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: "id không hợp lệ" });
    }

    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // ADMIN may only see users of their own organization
    if (!canAccessOrganization(req.user, user.organization_id)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem người dùng này" });
    }

    return res.status(200).json({ user: toUserDTO(user) });
  } catch (error) {
    console.error("Lỗi khi gọi getUser", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PATCH /api/users/:id
// Body (send only the fields to change, same names as /auth/signup):
//   fullname, email, phone, title        → SYSTEM_ADMIN and ADMIN
//   role (ADMIN or USER id), organization → SYSTEM_ADMIN only
// username cannot be changed.
export const updateUser = async (req, res) => {
  try {
    const target = await loadManageableUser(req, res);
    if (!target) return;

    const body = req.body ?? {};
    const isSystemAdmin = req.user.roleCode === "SYSTEM_ADMIN";
    const fields = {}; // column name → new value

    if ("username" in body) {
      return res.status(400).json({ message: "Không được đổi username" });
    }

    if ("fullname" in body) {
      const fullname = body.fullname;
      if (
        typeof fullname !== "string" ||
        !fullname.trim() ||
        fullname.trim().length > 255
      ) {
        return res.status(400).json({ message: "fullname không hợp lệ" });
      }
      fields.full_name = fullname.trim();
    }

    if ("email" in body) {
      // null or "" clears the email
      const email = body.email || null;
      if (
        email !== null &&
        (typeof email !== "string" || !EMAIL_PATTERN.test(email))
      ) {
        return res.status(400).json({ message: "email không hợp lệ" });
      }
      fields.email = email;
    }

    if ("phone" in body) {
      const phone = body.phone || null;
      if (phone !== null && (typeof phone !== "string" || phone.length > 20)) {
        return res.status(400).json({ message: "phone không hợp lệ" });
      }
      fields.phone = phone;
    }

    if ("title" in body) {
      if (!isPositiveInteger(body.title)) {
        return res.status(400).json({ message: "title không hợp lệ" });
      }
      fields.title_id = Number(body.title);
    }

    if ("role" in body || "organization" in body) {
      if (!isSystemAdmin) {
        return res.status(403).json({
          message: "Chỉ System Admin được đổi vai trò hoặc đơn vị",
        });
      }

      if ("role" in body) {
        const roleCode = isPositiveInteger(body.role)
          ? await findRoleCodeById(body.role)
          : null;
        // Only ADMIN <-> USER: a SYSTEM_ADMIN needs no organization (DB CHECK)
        if (roleCode !== "ADMIN" && roleCode !== "USER") {
          return res
            .status(400)
            .json({ message: "role chỉ được là ADMIN hoặc USER" });
        }
        fields.role_id = Number(body.role);
      }

      if ("organization" in body) {
        if (!isPositiveInteger(body.organization)) {
          return res
            .status(400)
            .json({ message: "organization không hợp lệ" });
        }
        fields.organization_id = Number(body.organization);
      }
    }

    if (Object.keys(fields).length === 0) {
      return res
        .status(400)
        .json({ message: "Không có thông tin nào để cập nhật" });
    }

    await updateUserFields(target.id, fields);

    // A new role or organization changes what the user may do: log them out
    // everywhere so their next login gets a token with the new claims.
    const roleChanged =
      "role_id" in fields && fields.role_id !== Number(target.role_id);
    const orgChanged =
      "organization_id" in fields &&
      fields.organization_id !== Number(target.organization_id);
    if (roleChanged || orgChanged) {
      await deleteUserSessions(target.id);
    }

    const updated = await findUserById(target.id);
    return res
      .status(200)
      .json({ message: "Cập nhật thành công", user: toUserDTO(updated) });
  } catch (error) {
    // Foreign key violation: title or organization id does not exist
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ message: "title hoặc organization không tồn tại" });
    }
    console.error("Lỗi khi gọi updateUser", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PATCH /api/users/:id/active   body: { "active": false }  (lock)
//                                     { "active": true }   (unlock)
export const setUserActive = async (req, res) => {
  try {
    const target = await loadManageableUser(req, res);
    if (!target) return;

    const { active } = req.body ?? {};
    if (typeof active !== "boolean") {
      return res
        .status(400)
        .json({ message: "active phải là true hoặc false" });
    }

    // Extra safety: nobody locks their own account
    if (String(target.id) === String(req.user.id)) {
      return res
        .status(400)
        .json({ message: "Không thể tự khóa tài khoản của mình" });
    }

    await setUserActiveInDb(target.id, active);

    // Locking ends every login session of that user immediately
    if (!active) {
      await deleteUserSessions(target.id);
    }

    const updated = await findUserById(target.id);
    return res.status(200).json({
      message: active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      user: toUserDTO(updated),
    });
  } catch (error) {
    console.error("Lỗi khi gọi setUserActive", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /api/users/:id/password   body: { "password": "new password" }
// Admin sets a new password for a user who forgot theirs.
export const resetUserPassword = async (req, res) => {
  try {
    const target = await loadManageableUser(req, res);
    if (!target) return;

    const { password } = req.body ?? {};
    if (
      typeof password !== "string" ||
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        message: `password phải dài từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await setUserPasswordHash(target.id, passwordHash);

    // Old sessions must not survive a password reset
    await deleteUserSessions(target.id);

    return res.status(200).json({ message: "Đã đặt lại mật khẩu" });
  } catch (error) {
    console.error("Lỗi khi gọi resetUserPassword", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
