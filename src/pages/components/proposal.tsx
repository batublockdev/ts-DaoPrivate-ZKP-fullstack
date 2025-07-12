"use client";
import ProposalCard from "./ProposalCard";
import SendModal from "./Modal"; // Adjust the import path as necessary
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
    const [showModal, setShowModal] = useState(false);
    const [vote, setVote] = useState<"1" | "0" | "2">("1"); // 1 for yes, 0 for no, 2 for abstain
    const [hasVoted, sethasVoted] = useState<boolean>(false);


    const router = useRouter();
    const { id } = router.query;


    useEffect(() => {
        if (id) {
            // Example: Fetch proposal or get from local state
            console.log("Selected proposal ID:", id);
            // Fetch or load from state/store
        }
    }, [id]);

    type ProposalStatus =
        | "Pending"
        | "Voting"
        | "Revealing"
        | "Succeeded"
        | "Defeated"
        | "Executed";
    const [proposal, setProposal] = useState<{
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
    }>({
        title: "ZK Treasury Funding",
        description: "Commit 1000 DAI to ZK privacy research.",
        proposer: "0x1234...abcd",
        status: "Voting", // or Revealing / Succeeded
        createdAt: "2025-07-06",
        deadline: "2025-07-10",
        votes: {
            yes: 20,
            no: 10,
            abstain: 2,
        },
    });


    const handleVote = (vote: "1" | "0" | "2") => {
        setVote(vote);
        setShowModal(true);
    };

    return (
        <div className="p-4">
            <ProposalCard hasVoted={hasVoted} proposal={proposal} onVote={handleVote} />
            <SendModal isOpen={showModal} vote={vote} onClose={() => setShowModal(false)} />

        </div>
    );
}
