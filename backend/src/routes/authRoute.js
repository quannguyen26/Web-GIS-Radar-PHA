import express from "express";
import {
  refreshToken,
  signIn,
  signOut,
  signUp,
} from "../controllers/authController.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Self-registration is disabled: only logged-in users can create accounts.
// TODO: restrict to admin roles once the permission model is defined.
router.post("/signup", protectedRoute, signUp);

router.post("/signin", signIn);

router.post("/signout", signOut);

router.post("/refresh", refreshToken);

export default router;
