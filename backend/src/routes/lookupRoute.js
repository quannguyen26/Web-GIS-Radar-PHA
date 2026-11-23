import express from "express";
import { getLookups } from "../controllers/lookupController.js";
import { requireRole } from "../middleware/authMiddleware.js";

// Mounted at /api/lookups behind protectedRoute (see server.js)
const router = express.Router();

// Form options for user management: SYSTEM_ADMIN and ADMIN only
router.get("/", requireRole("SYSTEM_ADMIN", "ADMIN"), getLookups);

export default router;
