import ProposalCard from "./ProposalCard";
import SendModal from "./Modal"; // Adjust the import path as necessary
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Page() {
    const [showModal, setShowModal] = useState(false);


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
        status: "Revealing", // or Revealing / Succeeded
        createdAt: "2025-07-06",
        deadline: "2025-07-10",
        votes: {
            yes: 20,
            no: 10,
            abstain: 2,
        },
    });


    const handleVote = (vote: "yes" | "no" | "abstain") => {
        setShowModal(true);
    };

    return (
        <div className="p-4">
            <ProposalCard proposal={proposal} onVote={handleVote} />
            <SendModal isOpen={showModal} onClose={() => setShowModal(false)} />

        </div>
    );
}
