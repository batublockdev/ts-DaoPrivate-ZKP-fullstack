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

    const handlesumitx = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const grothInput = {
            "root": "858598410922538527645468714695245647709074444307119415446401621921188130826",
            "secretNullifier": "456",
            "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "vote": "1",
            "secret": "789",
            "nullifierHash": "21722496458489112093414803228554251805332267507751634458902680792396968264905",
            "pathElements": [
                "5581525453447415493315491882928005573898416079263491592050413242111209948978",
                "1861686570734153038141835322989878516973043011574243984764688488465879742244",
                "16731048699270784421706570066001991137631760108429146124137121216236553054391",
                "16538499595934659613727544616962797785338492501618747306146816584688577735208",
                "9080356992685742511681529878226919830400349732756896631827555189762739734491",
                "5424144409132066577541240512439621178657103249409002506486103738618538352024",
                "10544296693406531387206535330554893730829540929428087193592756592216676445216",
                "7564988964993902948097824678805225006987812851830016626680599597402005451957",
                "12169719382686741916580483745316623687880402026431235449348059358607961733224",
                "8406940278843123175743832327158906184461007565351952961240403202786066254437",
                "18095170724440081982596227705073746612735437036256299083752673311093685115565",
                "12494921685926131790120916419089462187828486801312615440551414562915682918055",
                "10982166978621049276500916207228131554783228711662971846611531133859682131754",
                "20706006017932272733008726576435564635242694158389807366729547655972642914556",
                "12387411678914679768595095911604733054258673148265834445738162148229762835545",
                "4645457020147420961926028699764295047993990626023916925718742337202088609186",
                "20031172315068130033417068040619844856054469898708347831004393380441627976110",
                "10706546104333770657460492059417658198254511559412115282441046503143202741181",
                "11849011169801684430469139138252284578555021442080969739652766930478906494558",
                "3314372264187560584702178823305973219176593083766293720214567837146802335937"
            ],
            "pathIndices": [
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0"
            ]
        };

        const wasmPath = "/zkFiles/withdraw.wasm";
        const zkeyPath = "/zkFiles/withdraw_final.zkey";
        const vkeyPath = "/zkFiles/verification_key.json";


        console.log("Generated proof:x");
        const fullProof = await genProof_browser(grothInput, wasmPath, zkeyPath);
        console.log("Generated proof:", fullProof);
        const resp = await fetch(vkeyPath);
        const text = await resp.text();
        const vKey = JSON.parse(text)

        const res = await verifyProof(vKey, fullProof);
        setVerificationResult(res);
        console.log("Proof verification result:", res);
        if (res) {
            setVProof(fullProof.proof);
            setVPublicSignals(fullProof.publicSignals);
        }
    }
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

            <div>
                <label className="block font-medium mb-1">Upload Proof (.json)</label>
                <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, "proof")}
                    className="block w-full border p-2 rounded"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Upload Public Data (.json)</label>
                <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, "publicSignals")}
                    className="block w-full border p-2 rounded"
                />
            </div>

            <div className="mt-4 text-sm">
                <div>✅ Proof loaded: {proof ? "Yes" : "No"}</div>
                <div>✅ Public data loaded: {publicSignals ? "Yes" : "No"}</div>
            </div>
            <button
                onClick={handleVerify}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? "Verifying..." : "Verify Proof"}
            </button>
            <button
                onClick={handlesumitx}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? "Verifying..." : "xVerify Proofx"}
            </button>
            {verificationResult !== null && (
                <div className={`mt-2 font-semibold ${verificationResult ? "text-green-600" : "text-red-600"}`}>
                    {verificationResult ? "✅ Proof is valid!" : "❌ Invalid proof"}
                </div>
            )}
            {/* Show this only if the proof is valid */}
            {verificationResult === true && (
                <button
                    onClick={handleSaveToDatabase}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                    Save to Database
                </button>
            )}


        </form>
    );
};
export default FormA;
