import React from "react";

interface ProposalInfo {
    id: string;
    title: string;
    status: ProposalStatus;
    proposer: string;
    deadline: string;
}

type ProposalStatus =
    | "Pending"
    | "Active"
    | "Canceled"
    | "Defeated"
    | "Succeeded"
    | "Queued"
    | "Expired"
    | "Executed"
    | "Revealing";

const statusColors: Record<ProposalStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Active: "bg-purple-100 text-purple-800",
    Revealing: "bg-indigo-100 text-indigo-800",
    Succeeded: "bg-green-100 text-green-800",
    Defeated: "bg-red-100 text-red-800",
    Executed: "bg-gray-100 text-gray-800",
    Canceled: "bg-red-200 text-red-800",
    Expired: "bg-gray-200 text-gray-600",
    Queued: "bg-blue-100 text-blue-800",
};

interface ProposalListProps {
    proposals: ProposalInfo[];
    onSelect: (id: string) => void;
}

export default function ProposalList({ proposals, onSelect }: ProposalListProps) {
    return (
        <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">📜 All Proposals</h2>

            {proposals.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">No proposals available.</p>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {proposals.map((proposal) => (
                        <li
                            key={proposal.id}
                            onClick={() => onSelect(proposal.id)}
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        By {proposal.proposer} · Deadline: {proposal.deadline}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[proposal.status]}`}
                                >
                                    {proposal.status}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
