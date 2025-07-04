// components/FormSwitcher.tsx

import { useState } from "react";
import { GetPathFromIndex } from "../../utils/makletree";
const FormB = () => {
    const { genProof_browser, verifyProof } = require('../../src-zk/indexz.ts');
    interface ProofData {
        proof: any;
        publicSignals: any;
    }
    const [formData, setFormData] = useState<{ SecretNullifier: string; address: string; vote: string; secret: string; nullifierHash: string; index: string, pathElements: string[]; pathIndices: string[] }>({ SecretNullifier: "", address: "", vote: "", secret: "", nullifierHash: "", index: "", pathElements: [], pathIndices: [] });

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };



    const [Vproof, VsetProof] = useState<ProofData["proof"] | null>(null);
    const [VpublicSignals, VsetPublicSignals] = useState<ProofData["publicSignals"] | null>(null);
    const [verificationResult, setVerificationResult] = useState<null | boolean>(null);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});


    const validateForm = () => {
        const errors: { [key: string]: boolean } = {};

        if (!formData.SecretNullifier) errors.SecretNullifier = true;
        if (!formData.address) errors.address = true;
        if (!formData.vote) errors.vote = true;
        if (!formData.secret) errors.secret = true;
        if (!formData.nullifierHash) errors.nullifierHash = true;
        if (!formData.index) errors.index = true;

        const index = parseInt(formData.index);
        if (isNaN(index) || index < 0) {
            if (!formData.index) errors.index = true;

        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };
    const handleSaveToDatabase = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        try {
            const response = await fetch("/api/ds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proposal_id: 1,
                    field1: Vproof.pi_a[0],
                    field2: Vproof.pi_a[1],
                    field3: Vproof.pi_b[0][1],
                    field4: Vproof.pi_b[0][0],
                    field5: Vproof.pi_b[1][1],
                    field6: Vproof.pi_b[1][0],
                    field7: Vproof.pi_c[0],
                    field8: Vproof.pi_c[1],
                    transation_hash: "---", // Replace with actual transaction hash
                    sended: false, // Initial state
                    nullfier: VpublicSignals[1],
                    vote: VpublicSignals[2],
                }),
            });

            if (response.ok) {
                alert("✅ Data saved successfully!");
            } else {
                alert("❌ Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving proof:", error);
            alert("❌ Something went wrong.");
        }
    };
    const handlesumitx = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const isValid = validateForm();
        if (!isValid) return;


        setLoading(true);


        const index = parseInt(formData.index);

        console.log("Index changed:", index);


        const PathData = await GetPathFromIndex(index);
        console.log(PathData);

        const grothInput = {
            "root": "858598410922538527645468714695245647709074444307119415446401621921188130826",
            "secretNullifier": formData.SecretNullifier,
            "address": formData.address,
            "vote": formData.vote,
            "secret": formData.secret,
            "nullifierHash": formData.nullifierHash,
            "pathElements": PathData.pathElements,
            "pathIndices": PathData.pathIndices,
        };
        console.log("Groth input:", grothInput);

        const wasmPath = "/zkFiles/withdraw.wasm";
        const zkeyPath = "/zkFiles/withdraw_final.zkey";
        const vkeyPath = "/zkFiles/verification_key.json";


        console.log("Generated proof:x");
        try {
            const fullProof = await genProof_browser(grothInput, wasmPath, zkeyPath);
            console.log("Generated proof:", fullProof);
            const resp = await fetch(vkeyPath);
            const text = await resp.text();
            const vKey = JSON.parse(text)

            const res = await verifyProof(vKey, fullProof);
            setVerificationResult(res);
            if (res) {
                VsetProof(fullProof.proof);
                VsetPublicSignals(fullProof.publicSignals);
            }
            console.log("Proof verification result:", res);
            setLoading(false);
        }
        catch (error) {
            console.error("Error setting loading state:", error);
            setLoading(false);
            setVerificationResult(false);
        }

    }

    return (
        <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Nullifier</label>
                    <input
                        name="SecretNullifier"
                        value={formData.SecretNullifier}
                        onChange={handleChange}
                        type="password"
                        placeholder="••••••"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.SecretNullifier ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        type="text"
                        placeholder="0x1234...abcd"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vote</label>
                    <input
                        name="vote"
                        value={formData.vote}
                        onChange={handleChange}
                        placeholder="1"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.vote ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret</label>
                    <input
                        name="secret"
                        value={formData.secret}
                        onChange={handleChange}
                        type="password"
                        placeholder="••••••"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.secret ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nullifier Hash</label>
                    <input
                        name="nullifierHash"
                        value={formData.nullifierHash}
                        onChange={handleChange}
                        type="number"
                        placeholder="1234"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.nullifierHash ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Index</label>
                    <input
                        name="index"
                        value={formData.index}
                        onChange={handleChange}
                        type="number"
                        placeholder="1234"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.index ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-4 md:space-y-0 mt-6">
                <button
                    type="button"
                    onClick={handlesumitx}
                    disabled={loading}
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md"
                >
                    {loading ? "..." : "🧠 "}
                </button>

                {/* Buttons shown only if verification is successful */}
                {verificationResult === true && (
                    <>
                        {/* Save to DB */}
                        <button
                            onClick={handleSaveToDatabase}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all"
                        >
                            ✅ Save
                        </button>

                        {/* Send Button */}
                        <button
                            //onClick={handleSendProof}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all"
                        >
                            🚀 Send
                        </button>
                    </>
                )}

                {verificationResult === false && (
                    <div className="text-red-600 font-medium flex items-center">
                        ❌ Invalid proof — please check inputs
                    </div>
                )}
            </div>

        </form>

    );
};
export default FormB;
