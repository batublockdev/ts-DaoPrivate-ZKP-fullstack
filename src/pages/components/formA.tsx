// components/FormSwitcher.tsx
"use client";

import { useState } from "react";

const FormA = () => {
    const { genProof_browser, verifyProof } = require('../../src-zk/indexz.ts');


    const [input, setInput] = useState({
        root: "",
        secretNullifier: "",
        address: "",
        vote: "",
        secret: "",
        nullifierHash: "",
        pathElements: "",
        pathIndices: "",
    });

    interface ProofData {
        proof: any;
        publicSignals: any;
    }

    const [proof, setProof] = useState<ProofData["proof"] | null>(null);
    const [Vproof, setVProof] = useState<ProofData["proof"] | null>(null);

    const [publicSignals, setPublicSignals] = useState<ProofData["publicSignals"] | null>(null);
    const [VpublicSignals, setVPublicSignals] = useState<ProofData["publicSignals"] | null>(null);

    const [verificationResult, setVerificationResult] = useState<null | boolean>(null);
    const [loading, setLoading] = useState(false);


    const handleVerify = async () => {
        if (!proof || !publicSignals) {
            alert("Please upload both proof and public data.");
            return;
        }

        setLoading(true);
        try {

            const wasmPath = "/zkFiles/withdraw.wasm";
            const zkeyPath = "/zkFiles/withdraw_final.zkey";
            const vkeyPath = "/zkFiles/verification_key.json";

            //const fullProof = await genProof_browser(grothInput, wasmPath, zkeyPath);
            const resp = await fetch(vkeyPath);
            const text = await resp.text();
            const vKey = JSON.parse(text)

            const res = await verifyProof(vKey, { proof, publicSignals });
            setVerificationResult(res);
            console.log("Proof verification result:", res);
            if (res) {
                setVProof(proof);
                setVPublicSignals(publicSignals);
            }

        } catch (error) {
            console.error("Verification error:", error);
            setVerificationResult(false);
            setLoading(false);

        }
        setLoading(false);
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


    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        type: "proof" | "publicSignals"
    ) => {
        const file = event.target.files?.[0];
        if (!file || file.type !== "application/json") {
            alert("Please upload a valid JSON file.");
            return;
        }

        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            console.log("Uploaded JSON data:", jsonData);
            type === "proof" ? setProof(jsonData) : setPublicSignals(jsonData);
        } catch (err) {
            alert("Invalid JSON file.");
        }


    };
    return (
        <form className="space-y-4  ">

            {/* Upload Proof */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Proof (.json)
                </label>
                <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, "proof")}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Upload Public Signals */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Public Data (.json)
                </label>
                <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, "publicSignals")}
                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Status Indicator */}
            <div className="text-sm text-gray-700 space-y-1">
                <div>✅ Proof loaded: <span className={proof ? "text-green-600 font-semibold" : "text-red-500"}>{proof ? "Yes" : "No"}</span></div>
                <div>✅ Public data loaded: <span className={publicSignals ? "text-green-600 font-semibold" : "text-red-500"}>{publicSignals ? "Yes" : "No"}</span></div>
            </div>

            {/* Verify Button */}
            <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md"
            >
                {loading ? "Verifying..." : "🔍 Verify Proof"}
            </button>

            {/* Save Button + Status */}
            {verificationResult === true && (
                <>
                    <button
                        type="button"
                        onClick={handleSaveToDatabase}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md"
                    >
                        ✅ Save to Database
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

            {verificationResult !== null && (
                <div className={`text-center text-sm font-semibold ${verificationResult ? "text-green-600" : "text-red-600"}`}>
                    {verificationResult ? "✅ Proof is valid!" : "❌ Invalid proof"}
                </div>
            )}

        </form>
    );
};
export default FormA;
