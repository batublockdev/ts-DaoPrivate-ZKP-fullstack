require("dotenv").config();
console.log("📡 Connecting to DB with:", process.env.POSTGRES_URL);
const { ethers, Log } = require("ethers");
// Import your contract ABI
const abi = require("./abi.json"); // Adjust the path to your ABI file
const { Pool } = require("pg");




const conn = new Pool({
    connectionString: process.env.POSTGRES_URL,
});


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
async function fetchVoteCommitments(
    proposalIdToTrack: string,
    startBlock: number,
    endBlock: number
) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

    // Replace this with your contract's ABI

    // Contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`🔍 Scanning voteSummited events from block ${startBlock} to ${endBlock}...`);

    const filter = contract.filters.voteSummited(proposalIdToTrack); // no filter args yet
    const events = await contract.queryFilter(filter, startBlock, endBlock);
    console.log("Fisrt", events[0].args?.commitment?.toString());
    console.log("Second", events[1].args);
    events.forEach(async (event: typeof Log, i: number) => {
        const data = {
            proposalId: event.args?.proposalId?.toString(),
            commitment: event.args?.commitment?.toString(),
            index: event.args?.index?.toString()
        };
        await saveCommitmentToDb(data.proposalId, data.commitment, data.index);
    });
    /*const matching = events.filter(e =>
        e.args?.proposalId.toString() === proposalIdToTrack.toString()
    );

    console.log(`🧾 Found ${matching.length} votes for proposal ${proposalIdToTrack}`);

    for (const event of matching) {
        const { proposalId, commitment, index } = event.args!;
        await saveCommitmentToDb(proposalId.toString(), commitment, index.toNumber());
    }*/

    console.log("✅ Done fetching vote commitments.");
}
fetchVoteCommitments("70318868137747406498289237711490315320900460640035243523465954570595947937518", 1, 77);