import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { chainToAddress, ContractAbi } from '../constants';
import { useWatchContractEvent, useChainId, useConfig, useAccount } from 'wagmi';
import { getEthersProvider } from '../../Ether-Wagmi';
import { formatEther, ethers, parseEther } from 'ethers';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    const router = useRouter();
    const [name, setName] = useState("");
    const chainId = 31337;
    const config = useConfig();
    const addressContract = chainToAddress[chainId]['address'] as `0x${string}`;

    useEffect(() => {
        const fetchDataUser = async () => {
            // your async code here, e.g.:
            const provider = getEthersProvider(config)
            if (!provider) throw new Error('No provider found')

            const contract = new ethers.Contract(addressContract, ContractAbi, provider)

            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (typeof window !== "undefined") {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                setName(user.name || "");
            }
            const queryString = new URLSearchParams({
                user_id: user.id,
            }).toString();
            const response = await fetch(`/api/usersvote?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }

            });
            const data = await response.json();
            console.log("Proof gotten successfully:",);
            console.log(data.votes[0]);
            for (let i = 0; i < data.votes.length; i++) {
                const vote = data.votes[i];
                const proposal = await contract.state(BigInt(vote.proposal_id));
                console.log("Proposal state:", proposal);
                console.log("Vote:", vote);
            }

        };

        fetchDataUser();



    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm px-6 py-4">
            <div className="flex items-center justify-between w-full">
                {/* Left: Menu/Home Button */}
                <button
                    onClick={() => router.push("/")}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5m4 0h5a1 1 0 001-1V10"
                        />
                    </svg>
                </button>

                {/* Center: Title */}
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2">
                    {title}
                </h1>

                {/* Right: Username */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {name && (
                        <>
                            Welcome, <span className="font-semibold">{name}</span>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
