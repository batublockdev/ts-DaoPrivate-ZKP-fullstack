import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

// PostgreSQL connection (same config you used in listener)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { proposal_id } = query;

  if (proposal_id) {
    try {
      const result = await pool.query("SELECT * FROM proposals WHERE id = $1", [proposal_id]);

      return res.status(200).json({ proposals: result.rows });
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    try {
      const result = await pool.query("SELECT * FROM proposals ORDER BY created_at DESC");

      return res.status(200).json({ proposals: result.rows });
    } catch (error: any) {
      console.error("Error fetching proposals:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


}
