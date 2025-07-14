import React, { useState } from "react";

interface PendingVote {
    voter: string;
    voteOption: string;
}

interface RevealProgressTableProps {
    totalVotes: number;
    revealedVotes: number;
    pendingVotes: PendingVote[];
    onRevealMany: (voters: string[]) => void;
}

export default function RevealProgressTable({
    totalVotes,
    revealedVotes,
    pendingVotes,
    onRevealMany,
}: RevealProgressTableProps) {
    const [selected, setSelected] = useState<string[]>([]);

    const handleCheckbox = (voter: string) => {
        setSelected((prev) =>
            prev.includes(voter) ? prev.filter((v) => v !== voter) : [...prev, voter]
        );
    };

    const handleReveal = () => {
        if (selected.length > 0) {
            onRevealMany(selected);
            setSelected([]);
        }
    };

    const percent = Math.round((revealedVotes / totalVotes) * 100);

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            {/* Progress Bar */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reveal Progress</h2>
            <div className="mb-6">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all"
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {revealedVotes} of {totalVotes} votes revealed ({percent}%)
                </p>
            </div>

            {/* Reveal Button */}
            {selected.length > 0 && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={handleReveal}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Reveal Selected ({selected.length})
                    </button>
                </div>
            )}

            {/* Table */}
            <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
                    <tr>
                        <th className="px-4 py-3">
                            <span className="sr-only">Select</span>
                        </th>
                        <th className="px-6 py-3">Proposal</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                    {pendingVotes.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center px-6 py-4">
                                All votes revealed 🎉
                            </td>
                        </tr>
                    ) : (
                        pendingVotes.map((row) => (
                            <tr
                                key={row.voter}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(row.voter)}
                                        onChange={() => handleCheckbox(row.voter)}
                                        className="accent-indigo-600"
                                    />
                                </td>
                                <td className="px-6 py-3 font-mono">{row.voter}</td>
                                <td className="px-6 py-3 text-yellow-600">Pending Reveal</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
