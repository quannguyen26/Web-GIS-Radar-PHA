import express from "express";
import {
  refreshToken,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";
import { protectedRoute, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Self-registration is disabled: only SYSTEM_ADMIN and ADMIN can create accounts.
// Finer rules (which role / organization each may create) come in step 1.4.
router.post(
  "/signup",
  protectedRoute,
  requireRole("SYSTEM_ADMIN", "ADMIN"),
  signUp,
);

router.post("/signin", signIn);

router.post("/signout", signOut);

router.post("/refresh", refreshToken);

export default router;
