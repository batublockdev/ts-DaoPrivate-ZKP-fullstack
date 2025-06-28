import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;
    switch (method) {
        case "GET":
        ///return handleGet(req, res);
        case "POST":
            const { field1, field2, field3, field4, field5, field6, field7, field8, nullfier, vote } = body
            const query = 'INSERT INTO proof_table (field1, field2, field3, field4, field5, field6, field7, field8) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
            const values = [field1, field2, field3, field4, field5, field6, field7, field8];
            const response = await conn.query(query, values);


            const query2 = 'INSERT INTO publicdata_table (nullfier, vote, main_table_id) VALUES ($1, $2, $3) RETURNING *';
            const values2 = [nullfier, vote, response.rows[0].id];
            const response2 = await conn.query(query2, values2);
            res.status(200).json({ message: "Data inserted successfully", data: response2.rows[0] });
        case "DELETE":
        //return handleDelete(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    }

    const response = await conn.query("SELECT NOW()");
    res.status(200).json({ message: "API is working! ", result: response.rows[0] });
}