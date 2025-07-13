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
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const result = await pool.query("SELECT * FROM proposals ORDER BY created_at DESC");

    return res.status(200).json({ proposals: result.rows });
  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
