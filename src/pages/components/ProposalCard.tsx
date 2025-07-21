import React, { useMemo } from "react";
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
    votes?: {
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
    onCancel: () => void;
    onExecute: () => void;
    ready: boolean;
}

const ProposalCard: React.FC<Props> = ({ proposal, ready, onVote, onReveal, hasVoted, hasReveal, onCancel, onExecute }) => {
    const router = useRouter();
    const { yesPercent, noPercent, abstainPercent, yesTotal, noTotal, abstainTotoal } = useMemo(() => {
        const safeVotes = proposal?.votes ?? { yes: 0, no: 0, abstain: 0 };

        const totalVotes = Math.max(safeVotes.yes + safeVotes.no + safeVotes.abstain, 1);
        return {
            yesPercent: (safeVotes.yes / totalVotes) * 100,
            noPercent: (safeVotes.no / totalVotes) * 100,
            abstainPercent: (safeVotes.abstain / totalVotes) * 100,
            yesTotal: safeVotes.yes,
            noTotal: safeVotes.no,
            abstainTotoal: safeVotes.abstain,
        };
    }, [proposal]);
    if (!ready) {
        return (
            <div className="relative w-[80%] min-h-[70vh] mx-auto p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }
    if (!proposal) {
        return (
            <div className="p-4 text-center text-gray-500">
                Proposal data is not available.
            </div>
        );
    }
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
                <p><strong>Block start:</strong> {proposal.createdAt}</p>
                <p><strong>Block end:</strong> {proposal.deadline}</p>
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
            {proposal.status === "Revealing" && (
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
                        <VoteBar label="Yes" percent={yesPercent} count={yesTotal} color="green" />
                        <VoteBar label="No" percent={noPercent} count={noTotal} color="red" />
                        <VoteBar label="Abstain" percent={abstainPercent} count={abstainTotoal} color="gray" />
                    </div>
                    <p className="text-sm text-gray-500 italic mt-4">
                        {proposal.status === "Queued" &&
                            "Proposal is queued and awaiting execution."}
                        {proposal.status === "Expired" &&
                            "Proposal expired before it could be executed."}
                    </p>
                </>
            )}
            {(proposal.status === "Pending" || proposal.status === "Succeeded") && (
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    {proposal.status === "Pending" && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 w-full sm:w-auto"
                        >
                            Cancel Proposal
                        </button>
                    )}
                    {proposal.status === "Succeeded" && (
                        <button
                            onClick={onExecute}
                            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto"
                        >
                            Execute Proposal
                        </button>
                    )}
                </div>
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
