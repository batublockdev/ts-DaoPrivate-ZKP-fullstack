// components/FormSwitcher.tsx
import React from "react";
import { useRouter } from "next/router";


interface ProposalInfo {
    title: string;
    description: string;
    proposer: string;
    status: ProposalStatus;
    createdAt: string;
    deadline: string;
    votes: {
        yes: number;
        no: number;
        abstain: number;
    };
}
type ProposalStatus =
    | "Pending"
    | "Voting"
    | "Revealing"
    | "Succeeded"
    | "Defeated"
    | "Executed";

const statusColors: Record<ProposalStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Voting: "bg-purple-100 text-purple-800",
    Revealing: "bg-indigo-100 text-indigo-800",
    Succeeded: "bg-green-100 text-green-800",
    Defeated: "bg-red-100 text-red-800",
    Executed: "bg-gray-100 text-gray-800",
};


const ProposalCard = ({
    proposal,
    onVote,
}: {
    proposal: ProposalInfo;
    onVote: (vote: "1" | "0" | "2") => void;
}) => {
    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain || 1;
    const yesPercent = (proposal.votes.yes / totalVotes) * 100;
    const noPercent = (proposal.votes.no / totalVotes) * 100;
    const abstainPercent = (proposal.votes.abstain / totalVotes) * 100;
    const router = useRouter();



    return (
        <div className="relative w-[80%] min-h-[70vh] mx-auto p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 text-sm text-blue-600 dark:text-blue-400 hover:underline bg-transparent "
            >
                Back
            </button>
            <div className="flex justify-between items-start mb-4 mt-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{proposal.title}</h2>
                <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[proposal.status]}`}
                >
                    {proposal.status}
                </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{proposal.description}</p>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><strong>Proposer:</strong> {proposal.proposer}</p>
                <p><strong>Created:</strong> {proposal.createdAt}</p>
                <p><strong>Deadline:</strong> {proposal.deadline}</p>
            </div>
            {/* Voting Phase: show vote buttons only, no results */}
            {proposal.status === "Voting" && (
                <div className="flex flex-wrap gap-4 mt-4">
                    <button
                        onClick={() => onVote("1")}
                        className="text-base px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                        Vote Yes
                    </button>
                    <button
                        onClick={() => onVote("0")}
                        className="text-base px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                        Vote No
                    </button>
                    <button
                        onClick={() => onVote("2")}
                        className="text-base px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                    >
                        Abstain
                    </button>
                </div>
            )}



            {/* Final Phase: show results */}
            {["Succeeded", "Defeated", "Executed"].includes(proposal.status) && (
                <div className="space-y-4 mb-8 mt-6">
                    <VoteBar label="Yes" percent={yesPercent} count={proposal.votes.yes} color="green" />
                    <VoteBar label="No" percent={noPercent} count={proposal.votes.no} color="red" />
                    <VoteBar label="Abstain" percent={abstainPercent} count={proposal.votes.abstain} color="gray" />
                </div>
            )}

            <p className="text-sm text-gray-500 italic mt-4">
                {proposal.status === "Voting" && "Voting is private until the reveal phase."}
                {proposal.status === "Revealing" && "Votes are being revealed. Results will be visible soon."}
            </p>

        </div>
    );
};

const VoteBar = ({
    label,
    percent,
    count,
    color,
}: {
    label: string;
    percent: number;
    count: number;
    color: "green" | "red" | "gray";
}) => {
    const barColor = {
        green: "bg-green-500",
        red: "bg-red-500",
        gray: "bg-gray-500",
    }[color];

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-800 dark:text-gray-200 font-medium">{label}</span>
                <span className="text-gray-500 dark:text-gray-400">{count} ({percent.toFixed(1)}%)</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`${barColor} h-full`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProposalCard;


