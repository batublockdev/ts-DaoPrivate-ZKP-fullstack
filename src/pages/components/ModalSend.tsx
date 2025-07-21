"use client";

import { useState, useEffect } from "react";
import { useConnect, useDisconnect, useWatchContractEvent, useChainId, useConfig, useAccount, useWriteContract, useWaitForTransactionReceipt, } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { chainToAddress, ContractAbi } from '../constants';
import { useRouter } from "next/router";
import { getEthersProvider } from '../../Ether-Wagmi';
import { formatEther, ethers, parseEther } from 'ethers';

type dataProof = {
    publicData: bigint[][];
    proof: bigint[][];
}

type dataProposal = {
    targets: string[];
    values: bigint[];
    calldatas: string[];
    descriptionHash: string;
}

type funName = "cancel" | "_castVotes" | "propose" | "execute";


interface SendModalProps {
    isOpen: boolean;
    funtionName: funName;
    dataSend: dataProof | dataProposal;
    onClose: () => void;
    onSending: (result: boolean) => void;

}

const steps = [

    { title: "Sending", icon: "🚀" },
    { title: "Done", icon: "✅" },
];


export default function SendProofModal({ isOpen, funtionName, dataSend, onClose, onSending }: SendModalProps) {
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


    const [currentStep, setCurrentStep] = useState(0);
    const [errorx, setError] = useState("")
    const [currentScreen, setCurrentScreen] = useState(0);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "connecting" | "sending" | "Connected" | "success" | "error">("idle");

    if (funtionName === "cancel" || funtionName === "propose" || funtionName === "execute") {
        if (!dataSend || !("targets" in dataSend)) {
            throw new Error("Invalid dataSend for cancel, pospose or execute function");
        }
    }
    if (funtionName === "_castVotes") {
        if (!dataSend || !("publicData" in dataSend) || !("proof" in dataSend)) {
            throw new Error("Invalid dataSend for _castVotes function");
        }
    }

    const handleClick = async () => {
        try {



            if (isConnected === true) {
                Send();

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
            onSending(false);

        }
        if (isConfirmed === true) {
            console.log("Transaction confirmed:", hash);
            //saveDB();
            setStatus("success");
            setCurrentStep(1);
            setCurrentScreen(1); // 👈 Go to final screen
            onSending(true);
        };

    }, [isConfirmed, isError]);
    useEffect(() => {
        disconnect();
    }, []);

    /*const saveDB = async () => {
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
                alert("✅ Data saved successfully!");
            } else {
                alert("❌ Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving proof:", error);
            alert("❌ Something went wrong.");
        }
    }*/
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



    const Connect = async (): Promise<boolean> => {
        console.log("🔌 Connecting...");

        await connect({ connector: injected() });

        return true;
    };

    const Send = async () => {

        setStatus("sending");
        console.log("Transaction sent:11")




        console.log("Transaction sent:", funtionName);
        if (funtionName === "cancel" || funtionName === "propose" || funtionName === "execute") {
            if (dataSend && "targets" in dataSend) {
                try {
                    const txHash = await writeContractAsync({
                        abi: ContractAbi,
                        address: addressContract as `0x${string}`,
                        functionName: funtionName,
                        args: [
                            dataSend.targets,
                            dataSend.values,
                            dataSend.calldatas,
                            dataSend.descriptionHash,
                        ],
                    })
                    console.log("Transaction sent:", txHash)
                } catch (err) {
                    console.error("Transaction rejected or failed to send:", err)
                    setStatus("error");
                    onSending(false);
                    return;
                }
            }


            console.log("Transaction sent:1")


            return true;
        } else {
            console.log("Transaction sent con funname", funtionName);
            if (dataSend && "publicData" in dataSend) {
                console.log("Data send is public data")

                try {
                    const txHash = await writeContractAsync({
                        abi: ContractAbi,
                        address: addressContract as `0x${string}`,
                        functionName: funtionName,
                        args: [
                            dataSend.publicData,
                            dataSend.proof,
                        ],
                    })
                    console.log("Transaction sent:", txHash)
                } catch (err) {
                    console.error("Transaction rejected or failed to send:", err)
                    setStatus("error");
                    onSending(false);
                    return;
                }
            }
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
                        setStatus("idle");
                        setPassword("");
                        setConfirm("");
                        disconnect();
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ✖
                </button>

                {/* Steps */}

                <ol className="flex items-center justify-center gap-x-4 sm:gap-x-6 md:gap-x-8 mb-6">
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


                    ) : currentScreen === 1 ? (
                        <div className="space-y-4 text-center">
                            <div className="text-3xl">🎉</div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nice!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Thank you for participating in the private DAO.
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
                                    disconnect();

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
