// pages/api/votes.ts
import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    switch (method) {
        // 1. GET votes for a specific user or revealed
        case "GET":
            try {
                const { user_id } = query;

                if (!user_id) {
                    return res.status(400).json({ message: "Missing user_id" });
                }

                const getVotesQuery = `
                SELECT * FROM user_votes_table
                WHERE user_id = $1
              `;
                const response = await conn.query(getVotesQuery, [user_id]);
                return res.status(200).json({ votes: response.rows });
            } catch (error) {
                console.error("GET error:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }

        // 2. POST new vote
        case "POST":
            try {
                const { user_id, proposal_id, vote, reveal } = body;

                if (!user_id || !proposal_id) {
                    return res.status(400).json({ message: "Missing user_id or proposal_id" });
                }

                const insertVoteQuery = `
          INSERT INTO user_votes_table (user_id, proposal_id, vote, reveal)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, proposal_id)
          DO UPDATE SET vote = EXCLUDED.vote, reveal = EXCLUDED.reveal
          RETURNING *
        `;
                const values = [user_id, proposal_id, vote, reveal];
                const result = await conn.query(insertVoteQuery, values);

                return res.status(200).json({ message: "Vote saved", data: result.rows[0] });
            } catch (error) {
                console.error("POST error:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        // Inside your existing switch(method) block
        case "PUT":
            try {
                const { user_id, proposal_id, vote, reveal } = body;

                if (!user_id || !proposal_id) {
                    return res.status(400).json({ message: "Missing user_id or proposal_id" });
                }

                const updateQuery = `
        UPDATE user_votes_table
        SET vote = $1, reveal = $2
        WHERE user_id = $3 AND proposal_id = $4
        RETURNING *;
      `;
                const values = [vote, reveal, user_id, proposal_id];
                const result = await conn.query(updateQuery, values);

                if (result.rowCount === 0) {
                    return res.status(404).json({ message: "Vote not found for given user_id and proposal_id" });
                }

                return res.status(200).json({ message: "Vote updated successfully", data: result.rows[0] });
            } catch (error) {
                console.error("PUT error:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }

        // 3. DELETE vote by proposal_id
        case "DELETE":
            try {
                const { proposal_id } = body;

                if (!proposal_id) {
                    return res.status(400).json({ message: "Missing proposal_id" });
                }

                const deleteQuery = `DELETE FROM user_votes_table WHERE proposal_id = $1 RETURNING *`;
                const result = await conn.query(deleteQuery, [proposal_id]);

                return res.status(200).json({ message: "Vote deleted", data: result.rows[0] });
            } catch (error) {
                console.error("DELETE error:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
