import { useState, useEffect } from "react";
import RevealProgressTable from "./votes";
import SendProofModal from "./ModalSendProof"; // Adjust the import path as necessary





export default function RevealPage() {
    const [TOTAL, setTOTAL] = useState<number>(0);
    const [pendingVotes, setPendingVotes] = useState<{ nullfier: string; id: string }[]>([]);
    const [revealedCount, setRevealedCount] = useState(0);
    const [datadb, setdb] = useState([]);
    const [proof, setproof] = useState<bigint[][]>([]);
    const [publicData, setpublicData] = useState<bigint[][]>([]);
    const [showModal, setShowModal] = useState(false);



    const [INITIAL, setINITIAL] = useState<
        { nullfier: string; id: string }[]
    >([]);
    let INITIALx: { nullfier: string; id: string }[] = [];

    useEffect(() => {
        const fetchDataUser = async () => {
            // your async code here, e.g.:

            const response = await fetch(`/api/ds`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }

            });
            const data = await response.json();
            console.log("Proof gotten successfully:",);
            console.log(data.data);
            setdb(data.data);
            setTOTAL(data.data.length);
            const INITIALx = data.data.map((vote: any) => ({
                nullfier: vote.nullfier,
                id: vote.main_id
            }));
            setPendingVotes(INITIALx);
            setRevealedCount(TOTAL - INITIAL.length);
        };

        fetchDataUser();



    }, []);


    const handleRevealMany = (voters: string[]) => {
        setPendingVotes((prev) => prev.filter((v) => !voters.includes(v.id)));
        setRevealedCount((prev) => prev + voters.length);
        // Trigger your reveal logic for each voter here (e.g., Merkle + ZK)
        console.log("Revealing votes for:", voters);
        const proofx: bigint[][] = [];
        const publicx: bigint[][] = [];

        voters.forEach((voter) => {
            // Call your reveal function here, e.g., revealVote(voter);
            console.log(`Revealing vote for voter with ID: ${voter}`);
            datadb.forEach((vote: any) => {
                if (vote.main_id === voter) {

                    setpublicData(prev => [...prev, [
                        BigInt(vote.proposal_id),
                        BigInt(vote.nullfier),
                        BigInt(vote.vote),

                    ]]);
                    setproof(prev => [...prev, [
                        BigInt(vote.field1),
                        BigInt(vote.field2),
                        BigInt(vote.field3),
                        BigInt(vote.field4),
                        BigInt(vote.field5),
                        BigInt(vote.field6),
                        BigInt(vote.field7),
                        BigInt(vote.field8),
                    ]]);
                }
            }
            );
        });
        setShowModal(true);
    };

    return (
        <>
            <RevealProgressTable
                totalVotes={TOTAL}
                revealedVotes={revealedCount}
                pendingVotes={pendingVotes}
                onRevealMany={handleRevealMany}
            />
            <SendProofModal isOpen={showModal} proof={proof} publicData={publicData} onClose={() => setShowModal(false)} />
        </>

    );
}
