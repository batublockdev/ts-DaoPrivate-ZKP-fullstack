import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, query } = req;

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { proposal } = query;

    try {
        const query = 'SELECT leaf_index, leaf_value FROM makletree_leaves_table WHERE tree_id = $1 ORDER BY leaf_index ASC;';
        const response = await conn.query(query, [proposal]);

        return res.status(200).json({ message: "Data gotten successfully", data: response.rows });
    } catch (error) {
        console.error("Error getting data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }




}