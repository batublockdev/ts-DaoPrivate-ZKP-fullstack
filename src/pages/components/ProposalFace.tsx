import { useState, useEffect } from "react";
import ProposalList from "./proposallist";
import { useRouter } from "next/router";

type ProposalStatus =
    | "Pending"
    | "Voting"
    | "Revealing"
    | "Succeeded"
    | "Defeated"
    | "Executed";


interface Proposal {
    id: string;
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


export default function HomePage() {
    const router = useRouter();
    useEffect(() => {
        const fetchData = async () => {
            // your async code here, e.g.:
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const queryString = new URLSearchParams({
                user_id: user.id,
            }).toString();
            const response = await fetch(`/api/usersvote?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }

            });
            const data = await response.json();
            console.log("Proof gotten successfully:",);
            console.log(data);
        };

        fetchData();




    }, []);

    const [proposals, setProposals] = useState<Proposal[]>([
        {
            id: "1",
            title: "Increase Treasury Budget",
            proposer: "0x123...def",
            status: "Voting",
            deadline: "2025-07-12",
            description: "",
            createdAt: "",
            votes: {
                yes: 0,
                no: 0,
                abstain: 0
            }
        },
        {
            id: "2",
            title: "Fund Community Hackathon",
            proposer: "0xabc...456",
            status: "Succeeded",
            deadline: "2025-07-01",
            description: "",
            createdAt: "",
            votes: {
                yes: 0,
                no: 0,
                abstain: 0
            }
        },

    ]);

    const handleSelect = (id: string) => {
        router.push({
            pathname: "proposal",         // or `/proposal/${id}`
            query: { id },                // Send ID as query param
        });
    };

    return <ProposalList proposals={proposals} onSelect={handleSelect} />;
}
