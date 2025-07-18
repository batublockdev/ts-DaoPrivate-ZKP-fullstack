import { useState, useEffect } from "react";
import RevealProgressTable from "./votes";
import SendProofModal from "./ModalSend"; // Adjust the import path as necessary





export default function RevealPage() {
    const [TOTAL, setTOTAL] = useState<number>(0);
    const [voters, setVoters] = useState<string[]>([]);
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

    const isConfrimed = (result: boolean) => {
        if (result) {
            setPendingVotes((prev) => prev.filter((v) => !voters.includes(v.id)));
            setRevealedCount((prev) => prev + voters.length);
        } else {
            console.log("❌ Failed to reveal votes.");
        }
    };

    const handleRevealMany = (voters: string[]) => {

        // Trigger your reveal logic for each voter here (e.g., Merkle + ZK)
        console.log("Revealing votes for:", voters);


        voters.forEach((voter) => {
            // Call your reveal function here, e.g., revealVote(voter);
            console.log(`Revealing vote for voter with ID: ${voter}`);
            setVoters(voters);
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
            <SendProofModal onSending={isConfrimed} funtionName="_castVotes" isOpen={showModal} dataSend={{ publicData, proof }} onClose={() => setShowModal(false)} />
        </>

    );
}
