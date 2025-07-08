import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";
import jwt from "jsonwebtoken";
import { use } from "react";
const circomlibjs = require("circomlibjs");

let poseidon: any;

async function initPoseidon() {
    poseidon = await circomlibjs.buildPoseidon(); // remove "const"

}


export default async (req: NextApiRequest, res: NextApiResponse) => {

    const { method, body } = req;
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    try {
        const { name, username, password } = body
        if (!username || !password || !name) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        await initPoseidon();
        const usernameBigInt = BigInt(
            "0x" + Buffer.from(username).toString("hex")
        );
        const secretBigInt = BigInt(
            "0x" + Buffer.from(password).toString("hex")
        );
        const rawHash = poseidon([secretBigInt]);
        const result = poseidon.F.toObject(rawHash) as bigint;


        const query = 'INSERT INTO users_table ( name, username, password) VALUES ($1, $2, $3 )  RETURNING *';
        const values = [name, username, result];
        const response = await conn.query(query, values);

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Missing JWT_SECRET");
        }
        const token = jwt.sign({ id: response.rows[0].id }, secret, { expiresIn: '24h' });
        const rawHashUserId = poseidon([usernameBigInt, secretBigInt]);
        const resultId = (poseidon.F.toObject(rawHashUserId) as bigint).toString();

        return res.status(200).json({ message: "gotten successfully", data: token, user: { id: resultId, name: response.rows[0].name } });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Username already exists" });
        }

        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }


}

