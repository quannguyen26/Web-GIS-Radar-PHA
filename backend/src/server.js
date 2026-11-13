import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import timeRoute from "./routes/timesRoute.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";

dotenv.config();

// Fail fast when required configuration is missing
const REQUIRED_ENV = [
  "ACCESS_TOKEN_SECRET",
  "DB_USER",
  "DB_PASSWD",
  "DB_HOST",
  "DB_PORT",
  "DB_GEO_NAME",
  "DB_APP_NAME",
];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();

// Behind a reverse proxy, set TRUST_PROXY (e.g. "1") so rate limiting sees the real client IP
if (process.env.TRUST_PROXY) {
  const value = process.env.TRUST_PROXY;
  app.set("trust proxy", /^\d+$/.test(value) ? Number(value) : value);
}

// Rate limiters for authentication endpoints
const createLimiter = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
  });
const signInLimiter = createLimiter(10);
const refreshLimiter = createLimiter(60);

// Middlewares
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

// Public routes
app.use("/api/auth/signin", signInLimiter);
app.use("/api/auth/refresh", refreshLimiter);
app.use("/api/auth", authRoute);
app.use("/api/time", timeRoute);

// Protected routes
app.use("/api/users", protectedRoute, userRoute);

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Không tìm thấy API" });
});

// Final error handler: always respond with JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Dữ liệu JSON không hợp lệ" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Dữ liệu gửi lên quá lớn" });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Lỗi hệ thống" });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
