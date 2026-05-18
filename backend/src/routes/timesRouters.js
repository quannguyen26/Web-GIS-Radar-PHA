import express, { response } from "express";
import { getTimes } from "../controllers/timeControllers.js";

const router = express.Router();

router.get("/", getTimes);

export default router;
