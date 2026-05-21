import pool from "./database.js";

const initPostgresListener = async (productGroups, getLatestTimestamps) => {
  const pgClient = await pool.connect();
  await pgClient.query("LISTEN radar_update");

  pgClient.on("notification", async (msg) => {
    if (msg.channel === "radar_update") {
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

        // Query lấy 6 mốc mới nhất của riêng sản phẩm đó
        const latestTimes = await getLatestTimestamps(targetProduct);

        // Chỉ gửi cho những client thuộc nhóm đang xem sản phẩm này
        productGroups[targetProduct].forEach((client) => {
          client.res.write(
            `data: ${JSON.stringify({ timestamps: latestTimes })}\n\n`,
          );
        });
      }
    }
  });
};

export default initPostgresListener;
