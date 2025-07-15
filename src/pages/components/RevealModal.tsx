"use client";

import { useState, useEffect } from "react";
import { CreateCommitment, GetIndex, GetPathFromIndex } from "../../utils/makletree"; // Adjust the import path as necessary
import { useRouter } from "next/router";


interface SendModalProps {
    isOpen: boolean;
    proposalId: string | string[] | undefined;
    onClose: () => void;
}

const steps = [
    { title: "Creating", icon: "🧪" },
    { title: "Verifing", icon: "📦" },
    { title: "Done", icon: "✅" },
];



export default function RevealModal({ isOpen, proposalId, onClose }: SendModalProps) {
    interface ProofData {
        proof: any;
        publicSignals: any;
    }
    const { genProof_browser, verifyProof } = require('../../src-zk/indexz.ts');
    const router = useRouter();
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [CommitmentData, setCommitmentData] = useState<{ Commiment: string; Nullfier: string }>({ Nullfier: "", Commiment: "" });
    const [error, setError] = useState("")
    const [currentScreen, setCurrentScreen] = useState(0);
    const [password, setPassword] = useState("");
    const [Vproof, VsetProof] = useState<ProofData["proof"] | null>(null);
    const [VpublicSignals, VsetPublicSignals] = useState<ProofData["publicSignals"] | null>(null);
    const [confirm, setConfirm] = useState("");





    const saveDB = async (Vproofx: ProofData["proof"], VpublicSignalsx: ProofData["publicSignals"]) => {
        if (!Vproofx || !VpublicSignalsx) {
            console.error("Proof or public signals are not set.");
            return;
        }
        try {
            const response = await fetch("/api/ds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proposal_id: proposalId,
                    field1: Vproofx.pi_a[0],
                    field2: Vproofx.pi_a[1],
                    field3: Vproofx.pi_b[0][1],
                    field4: Vproofx.pi_b[0][0],
                    field5: Vproofx.pi_b[1][1],
                    field6: Vproofx.pi_b[1][0],
                    field7: Vproofx.pi_c[0],
                    field8: Vproofx.pi_c[1],
                    transation_hash: "---", // Replace with actual transaction hash
                    sended: false, // Initial state
                    nullfier: VpublicSignalsx[1],
                    vote: VpublicSignalsx[2],
                }),
            });

            if (response.ok) {
                console.log("✅ Data saved successfully!");
            } else {
                console.log("❌ Failed to save data.");

            }
        } catch (error) {
            console.error("Error saving proof:", error);
            console.log("❌ Something went wrong.");
        }
        //UPDATE DATA BASE
        try {
            const response = await fetch("/api/usersvote", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: (JSON.parse(localStorage.getItem("user") || "{}").id || ""),
                    proposal_id: proposalId,
                    vote: true,
                    reveal: false
                }),
            });

            if (response.ok) {
                console.log("✅ Data saved successfully!");
            } else {
                console.log("❌ Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving proof:", error);
            console.log("❌ Something went wrong.");
        }

        //UPDATE LOCALSTORAGE
        const VotingInfo = JSON.parse(localStorage.getItem("ProposalsVoted") || "{}");
        if (Array.isArray(VotingInfo)) {
            const updatedVotingInfo = VotingInfo.map((vote: any) => {
                if (vote.proposal_id === proposalId) {
                    return { ...vote, reveal: true };
                }
                return vote;
            });
            localStorage.setItem("ProposalsVoted", JSON.stringify(updatedVotingInfo));
        } else {
            console.error("VotingInfo is not an array:", VotingInfo);
        }
    }




    const choices = [
        { id: "1", label: "✅ Yes" },
        { id: "0", label: "❌ No" },
        { id: "2", label: "🤔 Abstain" },
    ];




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChoice) {
            setError("Please select a vote option.");
            return;
        }
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setError("");
        const user = JSON.parse(localStorage.getItem("user") || "{}");



        setCurrentScreen(1);
        setCurrentStep(1);
        let Input = {};
        let dataCommitment = {
            nullifierHash: "",
            commitment: "",
            username: "",
            secret: ""
        };
        try {
            dataCommitment = await CreateCommitment(user.id, selectedChoice, password)
            if (!dataCommitment) {
                setError("Failed to create commitment. Please try again.");
                return;
            }
            const index = await GetIndex(dataCommitment.commitment, proposalId);
            if (index === -1) {
                setError("Failed to get index for the commitment. Please try again.");
                return;
            }
            const path = await GetPathFromIndex(index, proposalId);
            if (!path) {
                setError("Failed to get path for the commitment. Please try again.");
                return;
            }
            setCommitmentData({ Commiment: dataCommitment.commitment, Nullfier: dataCommitment.nullifierHash });
            Input = {
                root: path.current.toString(),
                nullifierHash: dataCommitment.nullifierHash,
                username: dataCommitment.username,
                vote: selectedChoice,
                secret: dataCommitment.secret,
                pathElements: path.pathElements,
                pathIndices: path.pathIndices,
            };
            console.log("Input for proof generation:", Input);
        }
        catch (error) {
            console.error("Error creating commitment:", error);
            setError("Failed commitment. Please try again.");
            setCurrentScreen(0);
            setCurrentStep(0);
            return;
        }
        const wasmPath = "/zkFiles/voting.wasm";
        const zkeyPath = "/zkFiles/voting_final.zkey";
        const vkeyPath = "/zkFiles/verification_key.json";


        console.log("Generated proof:x");
        try {
            console.log("Generating proof with Input:", Input);
            const fullProof = await genProof_browser(Input, wasmPath, zkeyPath);
            console.log("Generated proof:", fullProof);
            const resp = await fetch(vkeyPath);
            const text = await resp.text();
            const vKey = JSON.parse(text)

            const res = await verifyProof(vKey, fullProof);
            if (res) {
                VsetProof(fullProof.proof);
                VsetPublicSignals(fullProof.publicSignals);
                saveDB(fullProof.proof, fullProof.publicSignals);
                setCurrentScreen(2);
                setCurrentStep(2);
            }
            console.log("Proof verification result:", res);
        }
        catch (error) {
            console.error("Error setting loading state:", error);
            setError("Failed verification. Please try again.");
            setCurrentScreen(0);
            setCurrentStep(0);
        }


    };








    if (!isOpen) return null;

    return (
        <div className=" fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md w-full max-w-3xl h-[75vh] p-8 relative flex flex-col">

                {/* Close button */}
                <button
                    onClick={() => {
                        onClose();
                        setCurrentScreen(0);
                        setCurrentStep(0);
                        setPassword("");
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ✖
                </button>

                {/* Steps */}

                <ol className="flex justify-between items-center mb-8 px-8">
                    {steps.map((step, index) => (
                        <li key={index} className="flex flex-col items-center text-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
            ${index < currentStep ? "bg-green-500" : index === currentStep ? "bg-blue-600 animate-pulse" : "bg-gray-300"}`}
                                >
                                    {index < currentStep ? "✔" : index + 1}
                                </div>
                                <span
                                    className={`mt-1 text-xs ${index === currentStep ? "text-blue-600 font-semibold" : "text-gray-500"}`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>


                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center px-4">


                    {currentScreen === 0 ? (

                        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto text-center">
                            {/* Warning Message */}
                            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-sm">
                                ⚠️ If the information is incorrect, the vote verification will fail.
                            </div>

                            {/* Choice Buttons */}
                            <div className="flex justify-center gap-4">
                                {choices.map((choice) => (
                                    <button
                                        key={choice.id}
                                        type="button"
                                        onClick={() => setSelectedChoice(choice.id)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${selectedChoice === choice.id
                                            ? "bg-blue-600 text-white border-blue-700"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                                            }`}
                                    >
                                        {choice.label}
                                    </button>
                                ))}
                            </div>

                            {/* Password Input */}
                            <div className="text-left">
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {error && <p className="text-sm text-red-600">{error}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition"
                            >
                                Reveal Vote
                            </button>
                        </form>
                    ) : currentScreen === 1 ? (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">Verfing data, this can take some time...</p>
                        </div>
                    ) : currentScreen === 2 ? (
                        <div className="space-y-4 text-center">
                            <div className="text-3xl">🎉</div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Vote Submitted!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your zero-knowledge vote was successfully saved. Thank you for participating in the private DAO.
                            </p>
                            <button
                                onClick={() => {
                                    onClose();
                                    setCurrentScreen(0);
                                    setCurrentStep(0);
                                    setPassword("");
                                    setError("");
                                    router.push("Home");
                                }}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
                            >
                                Close
                            </button>
                        </div>
                    ) : null}


                </div>
            </div>

        </div >

    );
}
