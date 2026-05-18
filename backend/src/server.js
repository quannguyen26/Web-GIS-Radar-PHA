import express from "express";
import timeRoute from "./routes/timesRouters.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express();
//middlewares
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

//API
app.use("/api/time", timeRoute);

app.listen(PORT, () => {
  console.log(`Sever Started at port ${PORT}}`);
});
