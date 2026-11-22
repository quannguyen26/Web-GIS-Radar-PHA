import express from "express";
import {
  authMe,
  getUser,
  listUsers,
  resetUserPassword,
  setUserActive,
  updateUser,
} from "../controllers/userController.js";
import { requireRole } from "../middleware/authMiddleware.js";

// Mounted at /api/users behind protectedRoute (see server.js)
const router = express.Router();

// Any logged-in user: own profile. Must stay before "/:id".
router.get("/me", authMe);

// User management: SYSTEM_ADMIN and ADMIN only (organization scope is
// checked inside the controllers)
const adminOnly = requireRole("SYSTEM_ADMIN", "ADMIN");

router.get("/", adminOnly, listUsers);
router.get("/:id", adminOnly, getUser);
router.patch("/:id", adminOnly, updateUser);
router.patch("/:id/active", adminOnly, setUserActive);
router.put("/:id/password", adminOnly, resetUserPassword);

export default router;
