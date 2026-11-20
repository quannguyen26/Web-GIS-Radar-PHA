import bcrypt from "bcrypt";
import poolApp from "../../libs/dbWebApp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { findUserByUsername, toUserDTO } from "../services/userService.js";
import { canAccessOrganization } from "../middleware/authMiddleware.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

// Helper to determine cookie settings based on environment
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL,
  };
};

const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores bytes beyond 72

const isPositiveInteger = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

// Return a user-facing error message, or null when the input is valid
const validateSignUpInput = ({
  username,
  password,
  fullname,
  email,
  phone,
  title,
  role,
  organization,
}) => {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    return "username phải dài 3–50 ký tự, chỉ gồm chữ, số và . _ -";
  }
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return `password phải dài từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`;
  }
  if (typeof fullname !== "string" || fullname.trim().length > 255) {
    return "fullName không hợp lệ";
  }
  if (email && (typeof email !== "string" || !EMAIL_PATTERN.test(email))) {
    return "email không hợp lệ";
  }
  if (phone && (typeof phone !== "string" || phone.length > 20)) {
    return "phone không hợp lệ";
  }
  if (![title, role, organization].every(isPositiveInteger)) {
    return "title, role và organization phải là ID hợp lệ";
  }
  return null;
};

// Which roles each creator role may create (spec section 3).
// Nobody may create SYSTEM_ADMIN through the API.
const CREATABLE_ROLES = {
  SYSTEM_ADMIN: ["ADMIN", "USER"],
  ADMIN: ["USER"],
};

// Generate an opaque random refresh token
const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

export const signUp = async (req, res) => {
  try {
    const {
      username,
      password,
      fullname,
      email,
      phone,
      title,
      role,
      organization,
    } = req.body;

    if (
      !username ||
      !password ||
      !fullname ||
      !title ||
      !role ||
      !organization
    ) {
      return res.status(400).json({
        message:
          "Không thể thiếu username, password, fullName, title, role và organization",
      });
    }

    const validationError = validateSignUpInput({
      username,
      password,
      fullname,
      email,
      phone,
      title,
      role,
      organization,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // The client sends a role id: look up its code instead of hardcoding ids
    const roleResult = await poolApp.query(
      "SELECT code FROM roles WHERE id = $1",
      [role],
    );
    const targetRoleCode = roleResult.rows[0]?.code;
    if (!targetRoleCode) {
      return res.status(400).json({ message: "role không tồn tại" });
    }

    // Creator's role comes from the signed token, never from the request body
    const creatableRoles = CREATABLE_ROLES[req.user.roleCode] ?? [];
    if (!creatableRoles.includes(targetRoleCode)) {
      return res
        .status(403)
        .json({ message: "Bạn không được tạo tài khoản với vai trò này" });
    }

    // ADMIN: only inside their own organization. SYSTEM_ADMIN: any organization.
    if (!canAccessOrganization(req.user, organization)) {
      return res.status(403).json({
        message: "Bạn chỉ được tạo tài khoản trong đơn vị của mình",
      });
    }

    // Check if username already exists
    const duplicate = await poolApp.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in PostgreSQL
    const insertQuery = `
      INSERT INTO users (username, password_hash, full_name, email, phone, title_id, role_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, full_name, role_id;
    `;
    const result = await poolApp.query(insertQuery, [
      username,
      hashedPassword,
      fullname,
      email,
      phone,
      title,
      role,
      organization,
    ]);

    const created = result.rows[0];
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: created.id,
        username: created.username,
        fullName: created.full_name,
        roleId: created.role_id,
      },
    });
  } catch (error) {
    // Foreign key violation: title or organization id does not exist
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ message: "title hoặc organization không tồn tại" });
    }
    // Unique violation: same username inserted at the same time
    if (error.code === "23505") {
      return res.status(409).json({ message: "username đã tồn tại" });
    }
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password." });
    }

    // Retrieve user by username
    const user = await findUserByUsername(username);

    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // Check password
    const passwordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // Generate access token with JWT
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roleId: user.role_id,
        roleCode: user.role_code,
        organizationId: user.organization_id,
        organizationType: user.organization_type,
      },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Generate refresh token
    const refreshToken = generateRefreshToken();

    // Clean up this user's expired sessions
    await poolApp.query(
      "DELETE FROM sessions WHERE user_id = $1 AND expires_at < NOW()",
      [user.id],
    );

    // Insert new session for refresh token
    const insertQuery = `
      INSERT INTO sessions (user_id, refresh_token, expires_at)
      VALUES ($1, $2, $3)
    `;

    await poolApp.query(insertQuery, [
      user.id,
      refreshToken,
      new Date(Date.now() + REFRESH_TOKEN_TTL),
    ]);

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    // Send access token and user info in response body
    return res.status(200).json({
      message: `User ${user.username} đã đăng nhập thành công!`,
      accessToken,
      user: toUserDTO(user),
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // Remove refresh token session from database
      await poolApp.query("DELETE FROM sessions WHERE refresh_token = $1", [
        token,
      ]);
    }

    // Clear refresh token cookie with matching options
    const cookieOptions = getCookieOptions();
    delete cookieOptions.maxAge;
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Generate new access token using refresh token
export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    // Query session joined with users to verify validity and obtain claims
    const result = await poolApp.query(
      `SELECT s.id AS session_id, s.user_id, s.expires_at,
              u.username, u.role_id, u.organization_id,
              r.code AS role_code,
              o.organization_type
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE s.refresh_token = $1`,
      [token],
    );
    const session = result.rows[0];

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc không tồn tại" });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await poolApp.query("DELETE FROM sessions WHERE refresh_token = $1", [
        token,
      ]);
      return res.status(403).json({ message: "Refresh Token đã hết hạn." });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: session.user_id,
        username: session.username,
        roleId: session.role_id,
        roleCode: session.role_code,
        organizationId: session.organization_id,
        organizationType: session.organization_type,
      },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Rotate the refresh token: the old one becomes invalid immediately.
    // expires_at is kept so a session cannot be extended forever.
    const newRefreshToken = generateRefreshToken();
    const rotated = await poolApp.query(
      "UPDATE sessions SET refresh_token = $1 WHERE id = $2 AND refresh_token = $3",
      [newRefreshToken, session.session_id, token],
    );
    if (rotated.rowCount === 0) {
      // Another request rotated this token concurrently
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc không tồn tại" });
    }

    const remainingMs = new Date(session.expires_at).getTime() - Date.now();
    res.cookie("refreshToken", newRefreshToken, {
      ...getCookieOptions(),
      maxAge: remainingMs,
    });

    // Return only the access token according to RESTful & JWT standards
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
