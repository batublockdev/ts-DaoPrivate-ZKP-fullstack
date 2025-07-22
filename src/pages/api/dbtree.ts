import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Always set these headers
    res.setHeader("Access-Control-Allow-Origin", "https://ts-dao-private-zkp-fullstack.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end(); // Preflight check response
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { proposal } = req.query;

    try {
        const query = `
      SELECT leaf_index, leaf_value
      FROM makletree_leaves_table
      WHERE tree_id = $1
      ORDER BY leaf_index ASC;
    `;
        const response = await conn.query(query, [proposal]);

        return res.status(200).json({ message: "Data gotten successfully", data: response.rows });
    } catch (error) {
        console.error("Error getting data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
