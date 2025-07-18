"use client";

import { useState, useEffect } from "react";
import { CreateCommitment } from "../../utils/makletree"; // Adjust the import path as necessary
import { useConnect, useDisconnect, useWatchContractEvent, useChainId, useConfig, useAccount, useWriteContract, useWaitForTransactionReceipt, } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { type UseConnectReturnType } from 'wagmi'
import { chainToAddress, ContractAbi } from '../constants';
import { useRouter } from "next/router";



interface SendModalProps {
    isOpen: boolean;
    vote: string;
    proposalId: string | string[] | undefined;
    onClose: () => void;
}

const steps = [
    { title: "Validating", icon: "🧪" },
    { title: "Preparing", icon: "📦" },
    { title: "Sending", icon: "🚀" },
    { title: "Done", icon: "✅" },
];


export default function SendModal({ isOpen, vote, proposalId, onClose }: SendModalProps) {
    const router = useRouter();
    const { address, connector, isConnected } = useAccount();
    const { connect, connectors, error } =
        useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const config = useConfig();
    const addressContract = chainToAddress[chainId]['address'] as `0x${string}`;

    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })
    const IdProposal = proposalId ? (typeof proposalId === "string" ? proposalId : "0") : "0";

    const [currentStep, setCurrentStep] = useState(0);
    const [CommitmentData, setCommitmentData] = useState<{ Commiment: string; Nullfier: string }>({ Nullfier: "", Commiment: "" });
    const [errorx, setError] = useState("")
    const [currentScreen, setCurrentScreen] = useState(0);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "connecting" | "sending" | "Connected" | "success" | "error">("idle");

    const handleClick = async () => {
        try {



            if (isConnected === true) {
                Send(CommitmentData);

            } else {
                setStatus("connecting");
                await Connect();
            }


        } catch (err: any) {
            setStatus("error");
            setError(err?.message || "Something went wrong");
        }
    };
    useEffect(() => {
        console.log(isConnected);

        if (isConnected === true) {
            setStatus("Connected");

        }
    }, [isConnected]);
    useEffect(() => {
        console.log("Pass: ", isConfirmed);
        console.log("Error: ", isError);
        if (isError) {
            console.error("Transaction failed:", error);
            setStatus("error");
            //setError(error?.message || "Transaction failed");

        }
        if (isConfirmed === true) {
            console.log("Transaction confirmed:", hash);
            saveDB();
            setStatus("success");
            setCurrentStep(3);
            setCurrentScreen(3); // 👈 Go to final screen
        };

    }, [isConfirmed, isError]);
    useEffect(() => {
        disconnect();
    }, []);

    const saveDB = async () => {
        try {
            const response = await fetch("/api/usersvote", {
                method: "POST",
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

        }
    }
    const renderMessage = () => {
        switch (status) {
            case "connecting":
                return "🔌 Connecting...";
            case "Connected":
                return "Connected";
            case "sending":
                return "📤 Sending data...";
            case "success":
                return "✅ Sent successfully!";
            case "error":
                return `❌ Transaction failed`;
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
        const user = JSON.parse(localStorage.getItem("user") || "{}");


        const updatedInputDB = {
            root: "",
            username: user.id,
            password: password,
            vote: vote,
            Nullfier: "",
            pathElements: [],
            pathIndices: []
        };
        console.log(updatedInputDB);
        setCurrentScreen(1);
        setCurrentStep(1);
        const dataCommitment = await CreateCommitment(updatedInputDB.username, updatedInputDB.vote, updatedInputDB.password)
        setCommitmentData({ Commiment: dataCommitment.commitment, Nullfier: dataCommitment.nullifierHash });
        await sleep(2000); // Wait 2 seconds

        setCurrentScreen(2);
        setCurrentStep(2);

    };


    const Connect = async (): Promise<boolean> => {
        console.log("🔌 Connecting...");

        await connect({ connector: injected() });

        await sleep(2000); // Wait 2 seconds
        return true;
    };

    const Send = async (data: { Commiment: string; Nullfier: string }) => {
        console.log("📤 Sending data:", data);
        setStatus("sending");

        try {
            console.log("Transaction sending ...", IdProposal)


            const txHash = await writeContractAsync({
                abi: ContractAbi,
                address: addressContract as `0x${string}`,
                functionName: "summitVote",
                args: [
                    BigInt(IdProposal),
                    BigInt(CommitmentData.Commiment)
                ],
            })
            console.log("Transaction sent:", txHash)
        } catch (err) {
            console.error("Transaction rejected or failed to send:", err)
        }
        console.log("Transaction sent:1")


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
                        setPassword("");
                        setConfirm("");
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

                        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm flex flex-col items-center">
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">Creating a paasword for your vote...</p>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                            </div>

                            {errorx && <p className="text-red-600 text-sm">{errorx}</p>}

                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
                            >
                                Create
                            </button>
                        </form>
                    ) : currentScreen === 1 ? (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">Creating your zero-knowledge ticket...</p>
                        </div>
                    ) : currentScreen === 2 ? (

                        <div className="space-y-3 text-center">

                            <button
                                onClick={handleClick}
                                disabled={status === "connecting" || status === "sending"}
                                className="w-60 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
                            >
                                {status === "idle" ? "🔗 Connect" : status === "connecting" ? "Connecting" : status === "Connected" ? "Send" : status === "sending" ? "Sending" : status === "error" ? "Send" : null}
                            </button>

                            {status !== "idle" && <p className="text-sm">{renderMessage()}</p>}
                        </div>


                    ) : currentScreen === 3 ? (
                        <div className="space-y-4 text-center">
                            <div className="text-3xl">🎉</div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Vote Submitted!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your zero-knowledge vote was successfully committed. Thank you for participating in the private DAO.
                            </p>
                            <button
                                onClick={() => {
                                    onClose();
                                    setCurrentScreen(0);
                                    setCurrentStep(0);
                                    setStatus("idle");
                                    setPassword("");
                                    setConfirm("");
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
