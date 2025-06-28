import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;
    switch (method) {
        case "GET":
        ///return handleGet(req, res);
        case "POST":
            const { field1, field2, field3, field4, field5, field6, field7, field8, nullfier, vote } = body
            const query = 'INSERT INTO proof_table (field1, field2, field3, field4, field5, field6, field7, field8) VALUES (10, 20, 30, 40, 50, 60, 70, 80)';
            const values = [field1, field2, field3, field4, field5, field6, field7, field8];
            const response = await conn.query(query, values);
        case "DELETE":
        //return handleDelete(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    }

    const response = await conn.query("SELECT NOW()");
    res.status(200).json({ message: "API is working! ", result: response.rows[0] });
}