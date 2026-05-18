import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWD,
  port: process.env.DB_PORT,
});

console.log('Hệ thống Database Pool đã sẵn sàng');

pool.on("error", (err) => {
  console.error("Lỗi kết nối Database ", err);
  process.exit(-1);
});

export default pool;

//
