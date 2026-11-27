import express from "express";
import { getCurrentTemplate } from "../controllers/bulletinTemplateController.js";
import { requireRole } from "../middleware/authMiddleware.js";

// Mounted at /api/bulletin-templates behind protectedRoute (see server.js)
const router = express.Router();

// Template for composing bulletins: ADMIN and USER (they have an organization)
router.get("/current", requireRole("ADMIN", "USER"), getCurrentTemplate);

export default router;
