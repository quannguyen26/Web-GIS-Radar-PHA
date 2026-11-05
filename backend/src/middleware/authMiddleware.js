// @ts-nocheck
import jwt from "jsonwebtoken";

// Middleware to verify JWT Access Token
export const protectedRoute = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    // Verify token with secret
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        // Return 401 so the frontend client knows to attempt a token refresh
        return res
          .status(401)
          .json({ message: "Access token hết hạn hoặc không hợp lệ" });
      }

      // Attach decoded payload to request object
      req.user = decodedUser;
      next();
    });
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
