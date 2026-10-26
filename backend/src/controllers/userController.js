import poolApp from "../../libs/dbWebApp.js";
export const authMe = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ authMiddleware

    const query = `
            SELECT
                u.id,
                u.username,

                t.id AS title_id,
                t.name AS title_name,

                r.id AS role_id,
                r.name AS role_name,

                o.id AS organization_id,
                o.name AS organization_name

            FROM users u

            LEFT JOIN titles t
                ON u.title_id = t.id

            LEFT JOIN roles r
                ON u.role_id = r.id

            LEFT JOIN organizations o
                ON u.organization_id = o.id

            WHERE u.id = $1;
        `;

    const result = await poolApp.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
