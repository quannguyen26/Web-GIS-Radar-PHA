import pool from "./database.js";

const initPostgresListener = async (productGroups, getLatestTimestamps) => {
  
  const pgClient = await pool.connect();
  await pgClient.query("LISTEN radar_product_update");

  pgClient.on("notification", async (msg) => {
    if (msg.channel === "radar_product_update") {
      const payload = JSON.parse(msg.payload);
      const targetProduct = payload.product; // Nhận diện xem sản phẩm nào vừa có dữ liệu mới
      // Chỉ khi có người đang xem sản phẩm này thì mới xử lý tiếp
      if (
        productGroups[targetProduct] &&
        productGroups[targetProduct].length > 0
      ) {
        console.log(
          `Phát hiện bản ghi mới cho [${targetProduct}], đang cập nhật nhóm...`,
        );

        // Chỉ lấy 1 mốc thời gian mới nhất vừa được chèn vào
        const latestTimeArr = await getLatestTimestamps(targetProduct, 1);
        if (latestTimeArr.length > 0) {
          const newTimestamp = latestTimeArr[0];
          // Chỉ gửi mốc mới này cho các client đang kết nối
          productGroups[targetProduct].forEach((client) => {
            client.res.write(
              `data: ${JSON.stringify({ newTimestamp })}\n\n`,
            );
          });
        }
      }
    }
  });
};

export default initPostgresListener;
