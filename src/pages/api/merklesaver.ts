const { ethers, Log } = require("ethers");
const abi = require("./abi.json"); // Adjust the path to your ABI file
import { start } from "repl";
import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";

// Config
const GOVERNOR_ADDRESS = process.env.GOVERNOR_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = '0xa8E2CBE69e098ac9D1053b07089403F94C07416D';

async function saveCommitmentToDb(proposalId: string, commitment: string, index: string) {
    const query = `
    INSERT INTO makletree_leaves_table (tree_id, leaf_index, leaf_value)
    VALUES ($1, $2, $3)
  `;
    try {
        await conn.query(query, [proposalId, index, commitment]);
        console.log(`✅ Inserted commitment at index ${index} for proposal ${proposalId}`);
    } catch (err) {
        console.error("❌ Error saving commitment to DB:", err);

        // Optional: delete all rows for this proposal if insert fails
        try {
            await conn.query(`DELETE FROM makletree_leaves_table WHERE tree_id = $1`, [proposalId]);
            console.warn(`⚠️ Deleted existing rows for proposalId ${proposalId} after error`);
        } catch (deleteErr) {
            console.error("❌ Failed to clean up database rows:", deleteErr);
        }
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { proposalIdToTrack, startBlock, endBlock } = req.body || {};

    if (!proposalIdToTrack || !startBlock || !endBlock) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        const dbCheck = await conn.query(
            `SELECT * FROM makletree_leaves_table WHERE tree_id = $1`,
            [proposalIdToTrack]
        );

        if (dbCheck.rows.length > 0) {
            console.log("✅ Commitments already exist in DB.");
            return res.status(200).json({ message: "Commitments already exist" });
        }

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const filter = contract.filters.voteSummited(proposalIdToTrack);
        const events = await contract.queryFilter(filter, Number(startBlock), Number(endBlock));

        console.log(`📜 Found ${events.length} voteSummited events for proposal ${proposalIdToTrack}.`);
        for (const [i, event] of events.entries()) {
            const data = {
                proposalId: event.args?.proposalId?.toString(),
                commitment: event.args?.commitment?.toString(),
                index: event.args?.index?.toString()
            };
            if (data.proposalId && data.commitment && data.index) {
                console.log("Starting so save", data.index);
                await saveCommitmentToDb(data.proposalId, data.commitment, data.index);
            } else {
                console.warn(`⚠️ Skipping malformed event at index ${i}`);
            }
        }



        console.log("✅ Finished syncing vote commitments.");
        return res.status(200).json({ message: "Vote commitments fetched and saved" });

    } catch (error) {
        console.error("❌ Fatal error during vote commitment sync:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
