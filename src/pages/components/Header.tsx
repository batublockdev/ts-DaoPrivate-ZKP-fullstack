import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { chainToAddress, ContractAbi } from '../../constants';
import { useWatchContractEvent, useChainId, useConfig, useAccount } from 'wagmi';
import { getEthersProvider } from '../../Ether-Wagmi';
import { formatEther, ethers, parseEther } from 'ethers';


export default function Header({ title = "PrivateDao", }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const chainId = 11155111;
    const config = useConfig();
    const addressContract = chainToAddress[chainId]['address'] as `0x${string}`;

    const [notifications, setNotifications] = useState<
        { message: string; read: boolean; id: string }[]
    >([]);
    useEffect(() => {
        const fetchDataUser = async () => {
            // your async code here, e.g.:
            const provider = getEthersProvider(config)
            if (!provider) throw new Error('No provider found')

            const contract = new ethers.Contract(addressContract, ContractAbi, provider)

            let user;

            if (typeof window !== "undefined") {
                user = JSON.parse(localStorage.getItem("user") || "{}");
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
            let ProposalsVoted = data.votes.map((vote: any) => ({
                proposal_id: vote.proposal_id,
                reveal: vote.reveal,
                vote: vote.vote
            }));
            localStorage.setItem("ProposalsVoted", JSON.stringify(ProposalsVoted));
            for (let i = 0; i < data.votes.length; i++) {
                const vote = data.votes[i];
                const proposal = await contract.state(BigInt(vote.proposal_id));
                if (proposal === BigInt(8)) {
                    // Revealing
                    setNotifications(prev => [
                        ...prev,
                        { message: `Time to reveal your vote #Proposal ${vote.id}`, read: false, id: vote.proposal_id.toString() }
                    ]);
                }
            }

        };

        fetchDataUser();



    }, []);
    // Sample notifications

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        // Clear local storage or session, then redirect
        localStorage.removeItem("user");
        router.push("/components/Login");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm px-6 py-4">
            <div className="flex items-center justify-between w-full">
                {/* Left: Home button */}
                <button
                    onClick={() => router.push("/components/Home")}
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

                {/* Right: Notifications + Logout */}
                <div className="flex items-center space-x-4">
                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(prev => !prev)}
                            className="relative text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
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
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50">
                                <ul className="text-sm text-gray-800 dark:text-gray-200 max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n, i) => (
                                            <li
                                                onClick={() => {
                                                    router.push(`/components/proposal?id=${n.id}`);
                                                    n.read = true; // Mark as read
                                                    setShowDropdown(false);
                                                }}
                                                key={i}
                                                className={`px-4 py-2 border-b dark:border-gray-700 ${n.read
                                                    ? "text-gray-500"
                                                    : "font-semibold text-gray-900 dark:text-white"
                                                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                                            >
                                                {n.message}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                                            No notifications
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Welcome + Logout */}
                    <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                        <span>Welcome, <strong>{name}</strong></span>
                        <button
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}



