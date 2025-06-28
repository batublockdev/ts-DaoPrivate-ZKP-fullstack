const fs = require("fs");
const { groth16 } = require("snarkjs");
const buildWitnessCalculator = require("./witness_calculator");

const genWnts = async (input, wasmFilePath) => {
    const buff = fs.readFileSync(wasmFilePath);
    const arrayBuffer = buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);

    const wc = await buildWitnessCalculator(arrayBuffer); // ✅ no redeclaration
    return await wc.calculateWTNSBin(input, 0);
};

const genProof = async (input, wasmPath, zkeyPath) => {
    const wtns = await genWnts(input, wasmPath);
    const zkeyBuff = fs.readFileSync(zkeyPath);
    const { proof, publicSignals } = await groth16.prove(new Uint8Array(zkeyBuff), wtns, null);
    return { proof, publicSignals };
};

const verifyProof = async (vKey, fullProof) => {
    return groth16.verify(vKey, fullProof.publicSignals, fullProof.proof);
};

module.exports = { genProof, verifyProof };
