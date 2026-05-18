import pool from "../../config/database.js";

export const getTimes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT ingestion FROM max_mosaic_index ORDER BY ingestion DESC LIMIT 12",
    );

    const times = result.rows.map((row) => row.ingestion.toISOString());
    res.status(200).json(times);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
