const { ethers, Log } = require("ethers");
const abi = require("./abi.json"); // Adjust the path to your ABI file
import { NextApiRequest, NextApiResponse } from "next";
import { conn } from "../../utils/database";
import { start } from "repl";






// Load ABI (replace with your actual ABI JSON)

// Config
const GOVERNOR_ADDRESS = process.env.GOVERNOR_ADDRESS!;
const RPC_URL = process.env.RPC_URL!;

// Simulated DB function
async function saveCommitmentToDb(proposalId: string, commitment: string, index: string) {
    try {



        // Insert into the DB
        const query = `
        INSERT INTO makletree_leaves_table (tree_id, leaf_index, leaf_value)
        VALUES ($1, $2, $3)
      `;

        await conn.query(query, [proposalId, index, commitment]);

        console.log("✅ Proposal inserted into DB.");
    } catch (err) {
        console.error("❌ Error saving proposal:", err);
    }
    // TODO: Insert into your real DB here
}

// Main function
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method, body } = req;
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
    if (!body || !body.proposalIdToTrack || !body.startBlock || !body.endBlock) {
        return res.status(400).json({ message: "Missing required parameters" });
    }
    const { proposalIdToTrack, startBlock, endBlock } = body
    try {
        const query = `
        SELECT * FROM makletree_leaves_table WHERE tree_id = $1
      `;

        const response = await conn.query(query, [proposalIdToTrack]);
        if (response.rows.length === 0) {
            try {
                const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
                const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

                // Replace this with your contract's ABI

                // Contract instance
                const contract = new ethers.Contract(contractAddress, abi, provider);

                const startBlockx = Number(startBlock);
                const endBlockx = Number(endBlock);
                console.log(`🔍 Scanning voteSummited events from block ${startBlockx} to ${endBlockx}...`);

                const filter = contract.filters.voteSummited(proposalIdToTrack); // no filter args yet
                const events = await contract.queryFilter(filter, startBlockx, endBlockx);
                console.log(`📜 Found ${events.length} voteSummited events for proposal ${proposalIdToTrack}.`);

                events.forEach(async (event: typeof Log, i: number) => {
                    const data = {
                        proposalId: event.args?.proposalId?.toString(),
                        commitment: event.args?.commitment?.toString(),
                        index: event.args?.index?.toString()
                    };
                    await saveCommitmentToDb(data.proposalId, data.commitment, data.index);
                });


                console.log("✅ Done fetching vote commitments.");
                return res.status(200).json({ message: "Vote commitments fetched successfully" });
            }
            catch (error) {
                console.error("❌ Error fetching vote commitments:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        }
        else {
            console.log("✅ Commitments already exist in the database for this proposal.");
            return res.status(200).json({ message: "Commitments already exist" });
        }
    }
    catch (error) {
        console.error("❌ Error in request body:", error);
        return res.status(400).json({ message: "Invalid request body" });
    }


}
//fetchVoteCommitments("70318868137747406498289237711490315320900460640035243523465954570595947937518", 1, 77);