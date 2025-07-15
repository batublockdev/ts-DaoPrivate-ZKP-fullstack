import React from "react";
import { useRouter } from "next/router";

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


interface Props {
    proposal: ProposalInfo;
    onVote: (vote: "1" | "0" | "2") => void;
    onReveal: () => void;
    hasVoted: boolean;
    hasReveal: boolean;
}

const ProposalCard: React.FC<Props> = ({ proposal, onVote, onReveal, hasVoted, hasReveal }) => {
    const router = useRouter();

    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain || 1;
    const yesPercent = (proposal.votes.yes / totalVotes) * 100;
    const noPercent = (proposal.votes.no / totalVotes) * 100;
    const abstainPercent = (proposal.votes.abstain / totalVotes) * 100;

    return (
        <div className="relative w-[80%] min-h-[70vh] mx-auto p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 text-sm text-blue-600 dark:text-blue-400 hover:underline bg-transparent"
            >
                Back
            </button>

            <div className="flex justify-between items-start mb-4 mt-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{proposal.title}</h2>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[proposal.status]}`}>
                    {proposal.status}
                </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">{proposal.description}</p>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                <p><strong>Proposer:</strong> {proposal.proposer}</p>
                <p><strong>Created:</strong> {proposal.createdAt}</p>
                <p><strong>Deadline:</strong> {proposal.deadline}</p>
            </div>

            {/* Voting Phase */}
            {proposal.status === "Active" && (
                <>
                    {!hasVoted ? (
                        <div className="flex flex-wrap gap-4 mt-4">
                            <VoteButton onClick={() => onVote("1")} label="Vote Yes" color="green" />
                            <VoteButton onClick={() => onVote("0")} label="Vote No" color="red" />
                            <VoteButton onClick={() => onVote("2")} label="Abstain" color="gray" />
                        </div>
                    ) : (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 italic mt-4">
                            You have already voted. Please wait for the reveal phase.
                        </p>
                    )}
                </>
            )}

            {/* Revealing Phase */}
            {proposal.status === "Revealing" && hasVoted && (
                <div className="mt-6">

                    {hasReveal ? (
                        <p className="text-green-600 mt-2">You have already revealed your vote.</p>
                    ) : (
                        <button
                            onClick={onReveal}
                            className="text-base px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >
                            Reveal My Vote
                        </button>
                    )}

                </div>
            )}

            {/* Final Result Phase */}
            {["Succeeded", "Defeated", "Executed", "Queued", "Expired"].includes(proposal.status) && (
                <>
                    <div className="space-y-4 mb-8 mt-6">
                        <VoteBar label="Yes" percent={yesPercent} count={proposal.votes.yes} color="green" />
                        <VoteBar label="No" percent={noPercent} count={proposal.votes.no} color="red" />
                        <VoteBar label="Abstain" percent={abstainPercent} count={proposal.votes.abstain} color="gray" />
                    </div>
                    <p className="text-sm text-gray-500 italic mt-4">
                        {proposal.status === "Queued" &&
                            "Proposal is queued and awaiting execution."}
                        {proposal.status === "Expired" &&
                            "Proposal expired before it could be executed."}
                    </p>
                </>
            )}

            {/* Status Note */}
            {proposal.status === "Canceled" && (
                <p className="text-sm text-red-600 dark:text-red-400 italic mt-6">
                    Proposal was canceled and will not be executed.
                </p>
            )}
            {proposal.status === "Active" && (
                <p className="text-sm text-gray-500 italic mt-4">
                    Voting is private until the reveal phase.
                </p>
            )}
            {proposal.status === "Revealing" && (
                <p className="text-sm text-gray-500 italic mt-4">
                    Votes are being revealed. Results will be visible soon.
                </p>
            )}
        </div>
    );
};

const VoteButton = ({
    onClick,
    label,
    color,
}: {
    onClick: () => void;
    label: string;
    color: "green" | "red" | "gray";
}) => {
    const colors = {
        green: "bg-green-600 hover:bg-green-700",
        red: "bg-red-600 hover:bg-red-700",
        gray: "bg-gray-600 hover:bg-gray-700",
    };
    return (
        <button
            onClick={onClick}
            className={`text-base px-6 py-3 text-white rounded-md ${colors[color]}`}
        >
            {label}
        </button>
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
                <span className="text-gray-500 dark:text-gray-400">
                    {count} ({percent.toFixed(1)}%)
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`${barColor} h-full`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
};

export default ProposalCard;
