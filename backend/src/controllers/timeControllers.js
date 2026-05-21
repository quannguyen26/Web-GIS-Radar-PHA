import pool from "../../config/database.js";

export const getTimes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT ingestion::text FROM max_mosaic_index ORDER BY ingestion DESC LIMIT 12",
    );

    const times = result.rows.map((row) => {
      const rawDate = row.ingestion.substring(0, 19);
      return `${rawDate.replace(" ", "T")}Z`;
    });
    res.status(200).json(times.reverse());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
