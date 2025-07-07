"use client";

import { useState, useEffect } from "react";
import { CreateCommitment } from "../../utils/makletree"; // Adjust the import path as necessary

interface SendModalProps {
    isOpen: boolean;

    onClose: () => void;
}

const steps = [
    { title: "Validating", icon: "🧪" },
    { title: "Preparing", icon: "📦" },
    { title: "Sending", icon: "🚀" },
    { title: "Done", icon: "✅" },
];


export default function SendModal({ isOpen, onClose }: SendModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [CommitmentData, setCommitmentData] = useState<{ Commiment: string; Nullfier: string }>({ Nullfier: "", Commiment: "" });
    const [InputDB, setInputDB] = useState<{ root: string; username: string; password: string; vote: string; Nullfier: string; pathElements: string[]; pathIndices: string[] }>({ root: "", username: "", password: "", vote: "", Nullfier: "", pathElements: [], pathIndices: [] });

    const [error, setError] = useState("")
    const [currentScreen, setCurrentScreen] = useState(0);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState<"idle" | "connecting" | "sending" | "Saving" | "success" | "error">("idle");

    const handleClick = async () => {
        try {
            setStatus("connecting");
            const connected = await Connect();

            setStatus("sending");
            await Send(CommitmentData);

            setStatus("Saving");
            await SaveDataDB(InputDB);

            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setError(err?.message || "Something went wrong");
        }
    };

    const renderMessage = () => {
        switch (status) {
            case "connecting":
                return "🔌 Connecting...";
            case "sending":
                return "📤 Sending data...";
            case "Saving":
                return "📤 saving data...";
            case "success":
                return "✅ Sent successfully!";
            case "error":
                return `❌ Error: ${error}`;
            default:
                return null;
        }
    };

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setError("");


        const updatedInputDB = {
            root: "",
            username: "bmosqueramor",
            password: password,
            vote: "1",
            Nullfier: "",
            pathElements: [],
            pathIndices: []
        };
        console.log(updatedInputDB);
        setInputDB(updatedInputDB);
        setCurrentScreen(1);
        setCurrentStep(1);
        const dataCommitment = await CreateCommitment(updatedInputDB.username, updatedInputDB.vote, updatedInputDB.password)
        setCommitmentData({ Commiment: dataCommitment.commitment, Nullfier: dataCommitment.nullifierHash });
        setInputDB((prev) => ({
            ...prev,
            Nullfier: dataCommitment.nullifierHash,
        }));
        console.log(InputDB);
        setCurrentScreen(2);
        setCurrentStep(2);

    };


    const Connect = async (): Promise<boolean> => {
        console.log("🔌 Connecting...");
        await sleep(2000); // Wait 2 seconds
        return true;
    };

    const Send = async (data: { Commiment: string; Nullfier: string }) => {
        console.log("📤 Sending data:", data);
        await sleep(2000); // Wait 2 seconds
        return true;
    };

    const SaveDataDB = async (data: { root: string; username: string; password: string; vote: string; Nullfier: string; pathElements: string[]; pathIndices: string[] }) => {
        console.log("💾 Saving to DB:", data);
        await sleep(2000); // Wait 2 seconds
        setCurrentScreen(3);
        setCurrentStep(3);
        return true;
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
                        setStatus("idle");
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ✖
                </button>

                {/* Steps */}

                <ol className="flex space-x-8 justify-center items-center mb-8">
                    {steps.map((step, index) => (
                        <li key={index} className="flex flex-col items-center text-center">
                            <span className={`text-3xl mb-1 ${index === currentStep ? "animate-bounce" : ""}`}>
                                {index < currentStep ? "✅" : index === currentStep ? step.icon : "🕓"}
                            </span>
                            <span
                                className={`text-sm ${index === currentStep ? "font-bold text-purple-600" : "text-gray-600 dark:text-gray-400"}`}
                            >
                                {step.title}
                            </span>
                        </li>
                    ))}
                </ol>


                {/* Content */}
                <div className="flex-1 space-y-4">
                    {currentScreen === 0 ? (
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    className="w-full border px-3 py-2 rounded"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full border px-3 py-2 rounded"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <p className="text-red-600 text-sm">{error}</p>}

                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
                            >
                                Create
                            </button>
                        </form>
                    ) : currentScreen === 1 ? (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-blue-600 font-medium">Creating voting ticket...</p>
                        </div>
                    ) : currentScreen === 2 ? (
                        <div className="space-y-3 text-center">
                            <button
                                onClick={handleClick}
                                disabled={status === "connecting" || status === "sending" || status === "Saving"}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {status === "idle" ? "Connect & Send" : "Processing..."}
                            </button>

                            {status !== "idle" && <p className="text-sm">{renderMessage()}</p>}
                        </div>
                    ) : null}


                </div>

            </div>
        </div>


    );
}
