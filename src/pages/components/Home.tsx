"use client";

import { useRouter } from "next/navigation";

export default function Homex() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto py-16 px-6 h-80 text-gray-800 dark:text-white">
            {/* Title */}
            <h1 className="text-4xl font-bold mb-6 text-center"> Welcome to the Private DAO</h1>

            {/* Description */}
            <p className="text-lg text-center mb-10">
                This is a secure and private DAO platform that allows members to vote anonymously
                using a two-phase protocol. The process includes:
            </p>

            {/* Voting Phases */}
            <ul className="list-disc list-inside mb-10 space-y-2 text-base">
                <li><strong>Phase 1 - Voting:</strong> Members submit encrypted votes anonymously.</li>
                <li><strong>Phase 2 - Counting:</strong> After the deadline, votes will be sent for counting.</li>
            </ul>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                <button
                    onClick={() => router.push("components/voteFace")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                >
                    🗳️ Pending Votes
                </button>

                <button
                    onClick={() => router.push("/components/ProposalFace")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                >
                    📄 View Proposals
                </button>

                <button
                    onClick={() => router.push("/admin")}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                >
                    ⚙️ Admin Actions
                </button>

                <button
                    onClick={() => router.push("/create-proposal")}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
                >
                    ➕ Create Proposal
                </button>
            </div>
        </div>
    );
}
