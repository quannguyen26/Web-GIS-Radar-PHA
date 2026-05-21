import express, { response } from "express";
import { getTimes } from "../controllers/timeControllerV2.js";

const router = express.Router();

router.get("/", getTimes);

export default router;

