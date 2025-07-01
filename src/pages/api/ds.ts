import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;
    switch (method) {
        case "GET":
            try {
                const query = 'SELECT m.id AS main_id, m.proposal_id, m.field1, m.field2, m.field3, m.field4, m.field5, m.field6, m.field7, m.field8, m.Transation_hash,  m.sended, r.id AS related_id, r.nullfier, r.vote FROM  proof_table m JOIN  publicdata_table r ON m.id = r.proof_table_id; ';
                const response = await conn.query(query);

                return res.status(200).json({ message: "Data inserted successfully", data: response.rows });
            } catch (error) {
                console.error("Error inserting data:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        case "POST":
            try {
                const { proposal_id, field1, field2, field3, field4, field5, field6, field7, field8, sended, nullfier, transation_hash, vote } = body
                const query = 'INSERT INTO proof_table (proposal_id, field1, field2, field3, field4, field5, field6, field7, field8, Transation_hash, sended) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *';
                const values = [proposal_id, field1, field2, field3, field4, field5, field6, field7, field8, transation_hash, sended];
                const response = await conn.query(query, values);


                const query2 = 'INSERT INTO publicdata_table (nullfier, vote, proof_table_id) VALUES ($1, $2, $3) RETURNING *';
                const values2 = [nullfier, vote, response.rows[0].id];
                const response2 = await conn.query(query2, values2);
                return res.status(200).json({ message: "Data inserted successfully", data: response2.rows[0] });
            } catch (error) {
                console.error("Error inserting data:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }

        case "PUT":
            try {
                const { ids } = body
                const query = 'UPDATE proof_table SET sended = TRUE WHERE id IN (' + ids + ') RETURNING *';
                const response = await conn.query(query);
                return res.status(200).json({ message: "Data inserted successfully", data: response.rows });
            } catch (error) {
                console.error("Error inserting data:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    }

}