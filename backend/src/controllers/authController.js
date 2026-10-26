import bcrypt from "bcrypt";
import poolApp from "../../libs/dbWebApp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

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

    // kiểm tra username tồn tại chưa
    const duplicate = await poolApp.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    // mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // Create a new user record in PostgreSQL
    const insertQuery = `
      INSERT INTO users (username, password_hash, full_name, email, phone, title_id, role_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6,$7, $8)
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

    // return
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
    // lấy inputs và kiểm tra
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password." });
    }

    // lấy hashedPassword trong db để so với password input
    const result = await poolApp.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // nếu khớp, tạo accessToken với JWT
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

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // // tạo session mới để lưu refresh token
    const insertQuery = `
      INSERT INTO sessions (user_id, refresh_token , expires_at)
      VALUES ($1, $2, $3)
    `;

    const resultInsert = await poolApp.query(insertQuery, [
      user.id,
      refreshToken,
      new Date(Date.now() + REFRESH_TOKEN_TTL),
    ]);

    // // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", //backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.username} đã logged in!`, accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xoá refresh token trong Session

      const deleteSession = await poolApp.query(
        "DELETE FROM sessions WHERE refresh_token = $1",
        [token],
      );

      // xoá cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// tạo access token mới từ refresh token
export const refreshToken = async (req, res) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }
    // so với refresh token trong db
    const result = await poolApp.query(
      "SELECT * FROM sessions WHERE refresh_token = $1",
      [token],
    );
    const session = result.rows[0];

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // kiểm tra hết hạn chưa
    if (session.expires_at < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn." });
    }

    // tạo access token mới
    const accessToken = jwt.sign(
      {
        id: session.user_id,
        // username: user.username,
        // roleId: user.role_id,
        // organizationId: user.organization_id,
      },
      // @ts-ignore
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // return
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
