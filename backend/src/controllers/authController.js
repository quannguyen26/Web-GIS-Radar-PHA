import bcrypt from "bcrypt";
import poolApp from "../../libs/dbWebApp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m"; // thuờng là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const signUp = async (req, res) => {
  try {
    const { username, password, fullname, title, role, organization } =
      req.body;

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
      INSERT INTO users (username, password_hash, full_name, title_id, role_id, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, full_name, role_id;
    `;
    const result = await poolApp.query(insertQuery, [
      username,
      hashedPassword,
      fullname,
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
