import { useState } from "react";
import RevealProgressTable from "./votes";

const TOTAL = 5;

const INITIAL = [
    { voter: "0x111...aaa", voteOption: "" },
    { voter: "0x222...bbb", voteOption: "" },
    { voter: "0x333...ccc", voteOption: "" },

];

export default function RevealPage() {
    const [pendingVotes, setPendingVotes] = useState(INITIAL);
    const [revealedCount, setRevealedCount] = useState(TOTAL - INITIAL.length);

    const handleRevealMany = (voters: string[]) => {
        setPendingVotes((prev) => prev.filter((v) => !voters.includes(v.voter)));
        setRevealedCount((prev) => prev + voters.length);
        // Trigger your reveal logic for each voter here (e.g., Merkle + ZK)
    };

    return (
        <RevealProgressTable
            totalVotes={TOTAL}
            revealedVotes={revealedCount}
            pendingVotes={pendingVotes}
            onRevealMany={handleRevealMany}
        />
    );
}
