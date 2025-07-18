"use client";
import ProposalCard from "./ProposalCard";
import SendModal from "./Modal"; // Adjust the import path as necessary
import RevealModal from "./RevealModal"; // Adjust the import path as necessary
import ActionsModal from "./ModalSend"; // Adjust the import path as necessary
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { chainToAddress, ContractAbi } from '../constants';
import { useWatchContractEvent, useChainId, useConfig, useAccount } from 'wagmi';
import { getEthersProvider } from '../../Ether-Wagmi';
import { formatEther, ethers, parseEther } from 'ethers';
import { keccak256 } from 'ethers/crypto';



export default function Page() {
    const [showModal, setShowModal] = useState(false);
    const [showRevealModal, setShowRevealModal] = useState(false);
    const [showActionsModal, setShowActionsModal] = useState(false);


    const [vote, setVote] = useState<"1" | "0" | "2">("1"); // 1 for yes, 0 for no, 2 for abstain
    const [hasVoted, sethasVoted] = useState<boolean>(false);
    const [hasReveal, sethasReveal] = useState<boolean>(false);
    const [ready, setReady] = useState<boolean>(false);
    const chainId = 31337;
    const config = useConfig();
    const addressContract = chainToAddress[chainId]['address'] as `0x${string}`;
    const [dataProposal, setDataProposal] = useState<{
        targets: string[];
        values: bigint[];
        calldatas: string[];
        descriptionHash: string;
    }>({
        targets: [],
        values: [],
        calldatas: [],
        descriptionHash: "",
    });

    const router = useRouter();
    const { id } = router.query;
    const VotingInfo = JSON.parse(localStorage.getItem("ProposalsVoted") || "{}");

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

    type funName = "cancel" | "execute";
    let funtionName: funName = "cancel";

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
        title: "",
        description: "",
        proposer: "",
        status: "Pending", // or Revealing / Succeeded
        createdAt: "",
        deadline: "",
        votes: {
            yes: 0,
            no: 0,
            abstain: 0,
        },
    });



    useEffect(() => {
        const fetchDataUser = async () => {
            if (id) {

                VotingInfo.forEach((vote: any) => {
                    if (vote.proposal_id === id.toString()) {
                        if (vote.vote === true) {
                            sethasVoted(true);
                            if (vote.reveal === true) {
                                sethasReveal(true);
                            }
                        }
                    }
                });

                // Example: Fetch proposal or get from local state
                console.log("Selected proposal ID:", id);
                // Fetch or load from state/store
                // your async code here, e.g.:
                const provider = getEthersProvider(config)
                if (!provider) throw new Error('No provider found')

                const contract = new ethers.Contract(addressContract, ContractAbi, provider)

                let user;

                if (typeof window !== "undefined") {
                    user = JSON.parse(localStorage.getItem("user") || "{}");

                }
                const queryString = new URLSearchParams({
                    proposal_id: id.toString(),
                }).toString();
                const response = await fetch(`/api/proposals?${queryString}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }

                });
                const data = await response.json();
                console.log("Proof gotten successfully:",);
                console.log(data.proposals[0]);
                const proposalStatus = await contract.state(BigInt(id.toString()));
                console.log("Proposal:", Number(proposalStatus));
                let status: ProposalStatus;
                let showVotes = false;

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
                        showVotes = true; // Show votes for defeated proposals
                        break;
                    case 4:
                        status = "Succeeded";
                        showVotes = true; // Show votes for succeeded proposals
                        break;
                    case 5:
                        status = "Queued";
                        showVotes = true; // Show votes for queued proposals
                        break;
                    case 6:
                        status = "Expired";
                        showVotes = true; // Show votes for expired proposals
                        break;
                    case 7:
                        status = "Executed";
                        showVotes = true; // Show votes for executed proposals
                        break;
                    case 8:
                        status = "Revealing";
                        await getCommitments(id.toString(), data.proposals[0].start_block.toString(), data.proposals[0].end_block.toString());
                        break;
                    default:
                        status = "Pending"; // Default case
                }

                if (showVotes) {
                    const [againstVotes, forVotes, abstainVotes] = await contract.proposalVotes(BigInt(id.toString()));
                    console.log("Votes:", forVotes, againstVotes, abstainVotes);
                    setProposal({
                        title: data.proposals[0].description,
                        description: data.proposals[0].description,
                        proposer: data.proposals[0].proposer,
                        status: status as ProposalStatus,
                        createdAt: new Date(data.proposals[0].start_block * 1000).toISOString().split('T')[0],
                        deadline: new Date(data.proposals[0].end_block * 1000).toISOString().split('T')[0],
                        votes: {
                            yes: Number(forVotes) / 1e18,
                            no: Number(againstVotes) / 1e18,
                            abstain: Number(abstainVotes) / 1e18,
                        },
                    }
                    )

                    setDataProposal({
                        targets: data.proposals[0].targets,
                        values: data.proposals[0].values.map((value: string) => BigInt(value)),
                        calldatas: data.proposals[0].calldatas,
                        descriptionHash: keccak256(Buffer.from(data.proposals[0].description, 'utf8')),
                    });

                    console.log("ready");
                    setReady(true);
                } else {
                    setProposal({
                        title: data.proposals[0].description,
                        description: data.proposals[0].description,
                        proposer: data.proposals[0].proposer,
                        status: status as ProposalStatus,
                        createdAt: new Date(data.proposals[0].start_block * 1000).toISOString().split('T')[0],
                        deadline: new Date(data.proposals[0].end_block * 1000).toISOString().split('T')[0],
                        votes: {
                            yes: 0,
                            no: 0,
                            abstain: 0,
                        },
                    })

                    setDataProposal({
                        targets: data.proposals[0].targets,
                        values: data.proposals[0].values.map((value: string) => BigInt(value)),
                        calldatas: data.proposals[0].calldatas,
                        descriptionHash: keccak256(Buffer.from(data.proposals[0].description, 'utf8')),
                    });
                    console.log("ready");
                    setReady(true);
                }
            }

        };

        fetchDataUser();

    }, [id]);


    const getCommitments = async (proposalId: string, startBlock: string, endBlock: string) => {
        try {
            const response = await fetch("/api/merklesaver", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proposalIdToTrack: proposalId,
                    startBlock: startBlock,
                    endBlock: endBlock,
                }),
            });

            if (response.ok) {
                console.log("✅ Data saved successfully!");
            } else {
                console.log("❌ Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving proof:", error);

        }
    };

    const handleVote = (vote: "1" | "0" | "2") => {
        setVote(vote);
        setShowModal(true);
    };
    const onReveal = () => {
        setShowRevealModal(true);
    }
    const onCancel = () => {
        funtionName = "cancel";
        setShowActionsModal(true);
    }
    const onExecute = () => {
        funtionName = "execute";
        setShowActionsModal(true);
    }
    if (!ready)
        return (<div className="relative w-[80%] min-h-[70vh] mx-auto p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>);
    return (
        <div className="p-4">
            <ProposalCard ready onCancel={onCancel} onExecute={onExecute} hasVoted={hasVoted} hasReveal={hasReveal} proposal={proposal} onReveal={onReveal} onVote={handleVote} />
            <SendModal isOpen={showModal} vote={vote} proposalId={id} onClose={() => setShowModal(false)} />
            <RevealModal isOpen={showRevealModal} proposalId={id} onClose={() => setShowRevealModal(false)} />
            <ActionsModal
                funtionName={funtionName}
                dataSend={dataProposal}
                isOpen={showActionsModal}
                onSending={(result: boolean) => {
                    console.log("Proposal sent:", result);
                }}
                onClose={() => setShowActionsModal(false)} />
        </div>
    );
}
