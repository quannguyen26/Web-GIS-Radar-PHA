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

/**
 * Middleware factory: only lets through users whose role code is in the list.
 * Must be placed AFTER protectedRoute (it reads req.user set by the token).
 *
 * Usage: router.post("/signup", protectedRoute, requireRole("SYSTEM_ADMIN", "ADMIN"), signUp);
 *
 * 401 = not logged in (who are you?), 403 = logged in but not allowed.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thực hiện thao tác này" });
    }

    next();
  };
};

// Which roles each creator role may create or assign (spec section 3).
// Nobody may create SYSTEM_ADMIN through the API. Used by /auth/signup and
// /lookups (so the form only offers roles the backend will accept).
export const CREATABLE_ROLES = {
  SYSTEM_ADMIN: ["ADMIN", "USER"],
  ADMIN: ["USER"],
};

/**
 * Organization check for data that belongs to an organization
 * (a user account, a bulletin, organization settings...).
 * SYSTEM_ADMIN may act on every organization; everyone else only on their own.
 *
 * Not a middleware: the target organization is usually known only after
 * reading the record from the DB, so controllers call this function.
 */
export const canAccessOrganization = (user, organizationId) => {
  if (!user) return false;
  if (user.roleCode === "SYSTEM_ADMIN") return true;
  // Compare as numbers: ids may come back from pg/JWT as string or number
  return (
    user.organizationId != null &&
    organizationId != null &&
    Number(user.organizationId) === Number(organizationId)
  );
};
