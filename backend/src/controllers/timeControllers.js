import pool from "../../config/database.js";
import initPostgresListener from "../../config/initPostgresListener.js";
import dotenv from "dotenv";

dotenv.config();

// Quản lý client theo nhóm sản phẩm: { "product_main": [res1, res2], "product_sub_1": [res3] }
let productGroups = {};

// Hàm bổ trợ lấy nhanh limit mốc thời gian dựa theo tên sản phẩm
const getLatestTimestamps = async (product, limit) => {
  let tableName = `${product.toLowerCase()}_mosaic_index`;
  // if (product === "HMAX") tableName = "hmax_mosaic_index";
  //   if (product === "product_sub_2") tableName = "radar_timestamps_sub2";

  const result = await pool.query(
    `SELECT ingestion::text FROM ${tableName} ORDER BY ingestion DESC LIMIT ${limit}`,
  );
  return result.rows.map((row) => {
    const rawDate = row.ingestion.substring(0, 19);
    return `${rawDate.replace(" ", "T")}Z`;
  });
};

// SSE Động
// mõi lầ ngọi api getime là 1 bản chạy độc lập (clientId được nhớ)
export const getTimes = async (req, res) => {
  const { product } = req.query; // Lấy loại sản phẩm từ Frontend gửi lên

  if (!product) {
    return res.status(400).json({ error: "Thiếu tham số product" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // //   res.setHeader("Access-Control-Allow-Origin", "*");

  // Khởi tạo nhóm nếu nhóm sản phẩm này chưa có ai xem
  if (!productGroups[product]) productGroups[product] = [];

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  productGroups[product].push(newClient);

  // // --- TỐI ƯU CỐT LÕI: Gửi ngay 12 mốc lịch sử lập tức khi vừa kết nối thành công ---
  try {
    const initTimes = await getLatestTimestamps(product, process.env.LIMIT_PRODUCTS);

    res
      .status(200)
      .write(
        `data: ${JSON.stringify({ timestamps: initTimes.reverse() })}\n\n`,
      );
  } catch (err) {
    console.error("Lỗi lấy dữ liệu ban đầu:", err);
  }

  // Xử lý hủy kết nối khi đổi sản phẩm hoặc đóng tab
  req.on("close", () => {
    console.log(
      `🔴 [TEST]: Kết nối có ID ${clientId} đã bị ngắt! Đang dọn dẹp...`,
    );
    productGroups[product] = productGroups[product].filter(
      (c) => c.id !== clientId,
    );
    console.log(
      `📊 Danh sách nhóm [${product}] hiện tại còn:`,
      productGroups[product].length,
      "Người",
    );
  });
};

// LẮNG NGHE POSTGRESQL VÀ ĐIỀU PHỐI ĐÚNG NHÓM
initPostgresListener(productGroups, getLatestTimestamps);
