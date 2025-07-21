require("dotenv").config();
console.log("📡 Connecting to DB with:", process.env.POSTGRES_URL);
const { ethers } = require("ethers");
// Import your contract ABI
const abi = require("./abi.json"); // Adjust the path to your ABI file
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});
console.log("📡 Connecting URL:", process.env.RPC_URL);

// Configs
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractAddress = '0xa8E2CBE69e098ac9D1053b07089403F94C07416D';

// Replace this with your contract's ABI

// Contract instance
const contract = new ethers.Contract(contractAddress, abi, provider);

// Event Listener
contract.on("ProposalCreated", async (
    id,
    proposer,
    targets,
    values,
    signatures,
    calldatas,
    startBlock,
    endBlock,
    description
) => {
    const eventData = {
        id: id.toString(),
        proposer,
        targets,
        values: values.map(v => v.toString()),
        signatures,
        calldatas,
        startBlock: startBlock.toString(),
        endBlock: endBlock.toString(),
        description
    };

    console.log("New Proposal Created:", eventData);

    try {
        console.log("📥 New Proposal Created:", id.toString());

        // Convert values to the proper format
        const proposalId = id.toString();
        const start = startBlock.toString();
        const end = endBlock.toString();
        const valuesStr = values.map(v => v.toString());

        // Try to get the deadline timestamp (may be null if block hasn't been mined yet)
        let deadline = null;
        try {
            const block = await provider.getBlock(Number(end));
            if (block) {
                deadline = new Date(block.timestamp * 1000); // Convert UNIX timestamp to JS Date
            }
        } catch (e) {
            console.warn(`⚠️ Deadline block #${end} not yet mined.`);
        }

        // Insert into the DB
        await pool.query(
            `INSERT INTO proposals (
            id, proposer, targets, values, signatures, calldatas, description,
            start_block, end_block, deadline, status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11
          )`,
            [
                proposalId,
                proposer,
                targets,
                valuesStr,
                signatures,
                calldatas,
                description,
                start,
                end,
                deadline,
                'Pending'
            ]
        );

        console.log("✅ Proposal inserted into DB.");
    } catch (err) {
        console.error("❌ Error saving proposal:", err);
    }
});

