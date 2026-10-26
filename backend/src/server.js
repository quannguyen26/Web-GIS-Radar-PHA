import express from "express";
import timeRoute from "./routes/timesRoute.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express();

//middlewares
app.use(cors({ origin: "http://localhost:5173" }));
app.use(cookieParser());
app.use(express.json());

// public routes
app.use("/api/auth", authRoute);
app.use("/api/time", timeRoute);

// private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
