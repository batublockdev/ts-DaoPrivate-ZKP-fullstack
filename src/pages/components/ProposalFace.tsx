import { useState, useEffect } from "react";
import ProposalList from "./proposallist";
import { useRouter } from "next/router";
import { chainToAddress, ContractAbi } from '../../constants';
import { useWatchContractEvent, useChainId, useConfig, useAccount } from 'wagmi';
import { getEthersProvider } from '../../Ether-Wagmi';
import { formatEther, ethers, parseEther, JsonRpcProvider } from 'ethers';
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


interface Proposal {
    id: string;
    title: string;
    proposer: string;
    status: ProposalStatus;
    blockEnd: string;

}


export default function HomePage() {
    const router = useRouter();
    const [proposalsx, setProposals] = useState<Proposal[]>([]);
    const { chain } = useAccount();
    const chainId = 11155111;
    const config = useConfig();
    const addressContract = chainToAddress[chainId]['address'] as `0x${string}`;

    useEffect(() => {
        const fetchData = async () => {
            // your async code here, e.g.:
            const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/Kxrl2esuvfth6B-gfktr-")

            if (!provider) throw new Error('No provider found')

            const contract = new ethers.Contract(addressContract, ContractAbi, provider)
            const user = JSON.parse(localStorage.getItem("user") || "{}");



            const response2 = await fetch(`/api/proposals`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }

            });
            const datax = await response2.json();
            console.log("Proposal gotten",);
            console.log(datax.proposals);
            if (datax?.proposals && Array.isArray(datax.proposals)) {
                datax?.proposals?.forEach(async (proposal: { id: string; description: any; proposer: any; end_block: string }) => {


                    const proposalStatus = await contract.state(BigInt(proposal.id));
                    let status: ProposalStatus;
                    switch (Number(proposalStatus)) {
                        case 0:
                            status = "Pending";
                            break;
                        case 1:
                            status = "Active";
                            break;
                        case 2:
                            status = "Canceled";
                            break;
                        case 3:
                            status = "Defeated";
                            break;
                        case 4:
                            status = "Succeeded";
                            break;
                        case 5:
                            status = "Queued";
                            break;
                        case 6:
                            status = "Expired";
                            break;
                        case 7:
                            status = "Executed";
                            break;
                        case 8:
                            status = "Revealing";
                            break;
                        default:
                            status = "Pending"; // Default case
                    }
                    // Assuming proposal has properties id, title, proposer, status, deadline
                    setProposals(prev => [...prev, {
                        id: proposal.id,
                        title: proposal.description,
                        proposer: proposal.proposer,
                        status: status as ProposalStatus,
                        blockEnd: proposal.end_block.toString()
                    }]);

                });

            }
        };

        fetchData();




    }, []);
    const handleSelect = (id: string) => {
        router.push({
            pathname: "proposal",         // or `/proposal/${id}`
            query: { id },                // Send ID as query param
        });
    };

    return <ProposalList proposals={proposalsx} onSelect={handleSelect} />;
}
