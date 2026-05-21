import pool from "../../config/database.js";
import initPostgresListener from "../../config/initPostgresListener.js";

// Quản lý client theo nhóm sản phẩm: { "product_main": [res1, res2], "product_sub_1": [res3] }
let productGroups = {};

// Hàm bổ trợ lấy nhanh 6 mốc thời gian dựa theo tên sản phẩm/bảng
const getLatestTimestamps = async (product) => {
  let tableName = "max_mosaic_index"; // Mặc định
  if (product === "hmax") tableName = "hmax_mosaic_index";
  //   if (product === "product_sub_2") tableName = "radar_timestamps_sub2";

  const result = await pool.query(
    `SELECT ingestion::text FROM ${tableName} ORDER BY ingestion DESC LIMIT 12`,
  );
  return result.rows.map((row) => row.ingestion);
};

// SSE Động
// mõi lầ ngọi api getime là 1 bản chạy độc lập (clientId được nhớ)
export const getTimes = async (req, res) => {
    const { product } = req.query; // Lấy loại sản phẩm từ Frontend gửi lên (ví dụ: product_main)
    let tableName = "max_mosaic_index_test"; // Mặc định
    if (product === "hmax") tableName = "hmax_mosaic_index_test";
      if (!product) {
        return res.status(400).json({ error: "Thiếu tham số product" });
      }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    //   res.setHeader("Access-Control-Allow-Origin", "*");

    // Khởi tạo nhóm nếu nhóm sản phẩm này chưa có ai xem
    if (!productGroups[product]) productGroups[product] = [];

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    productGroups[product].push(newClient);

    // --- TỐI ƯU CỐT LÕI: Gửi ngay 6 mốc lịch sử lập tức khi vừa kết nối thành công ---
    try {
        const initTimes = await getLatestTimestamps(product);
        res.write(`data: ${JSON.stringify({ timestamps: initTimes })}\n\n`);
    } catch (err) {
        console.error('Lỗi lấy dữ liệu ban đầu:', err);
    }
        

    // Xử lý hủy kết nối khi đổi sản phẩm hoặc đóng tab
    req.on("close", () => {
      productGroups[product] = productGroups[product].filter(
        (c) => c.id !== clientId,
      );
    });
};

// LẮNG NGHE POSTGRESQL VÀ ĐIỀU PHỐI ĐÚNG NHÓM
initPostgresListener(productGroups, getLatestTimestamps);
