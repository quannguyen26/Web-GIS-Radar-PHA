import express from "express";
import { getTimes } from "../controllers/timeController.js";

const router = express.Router();

router.get("/", getTimes);

export default router;
