import bcrypt from "bcrypt";
import poolApp from "../../libs/dbWebApp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: result.rows[0],
    });
  } catch (error) {
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
    const result = await poolApp.query(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.phone,
              u.title_id, u.role_id, u.organization_id,
              r.name AS role_name, o.name AS organization_name, t.name AS title_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN organizations o ON u.organization_id = o.id
       LEFT JOIN titles t ON u.title_id = t.id
       WHERE u.username = $1`,
      [username],
    );
    const user = result.rows[0];

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
        organizationId: user.organization_id,
      },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

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
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        roleName: user.role_name,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        titleId: user.title_id,
        titleName: user.title_name,
      },
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
              u.username, u.role_id, u.organization_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
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
        organizationId: session.organization_id,
      },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Return only the access token according to RESTful & JWT standards
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
