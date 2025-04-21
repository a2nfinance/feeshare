"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { abi } from "@/lib/abi/DAO.json";
import { abi as ProgramFactoryABI } from "@/lib/abi/ProgramFactory.json";
import { config } from "@/lib/wagmi";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BaseError, parseEventLogs } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useReadContract, useWriteContract } from "wagmi";


type ProposalVotingCardProps = {
    proposalDBId: string,
    params: any,
    proposalId: number;
    contractAddress: `0x${string}`;
    daoId: string,
    proposalType: string
};

export default function ProposalVotingCard({ proposalDBId, params, proposalId, contractAddress, daoId, proposalType }: ProposalVotingCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { address, chainId } = useAccount()
    const { data: memberCount } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getMemberCount",
    });

    const { data: quorum } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "quorum",
    });

    const { data: votingThreshold } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "votingThreshold",
    });
    const { data: proposal }: { data: any } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "proposals",
        args: [proposalId],
    });

    const { writeContractAsync } = useWriteContract();



    const handleVote = async (support: boolean) => {
        try {
            setIsVoting(true);

            const tx = await writeContractAsync({
                abi,
                address: contractAddress,
                functionName: 'vote',
                args: [proposalId, support]
            })

            // @ts-ignore
            await waitForTransactionReceipt(config.getClient(chainId), {
                hash: tx,
            });

        } catch (err: any) {
            if (err instanceof BaseError) {
                toast.error(`Error: ${err.shortMessage}`)
            } else {
                toast.error(`Error: ${err.message}`)
            }
        } finally {
            setIsVoting(false);
        }
    };

    const handleExecuteProposal = async () => {
        try {
            setIsProcessing(true)
            const tx = await writeContractAsync({
                abi,
                address: contractAddress,
                functionName: 'executeProposal',
                args: [proposalId]
            })

            // @ts-ignore
            const receipt = await waitForTransactionReceipt(config.getClient(chainId), {
                hash: tx,
            });

            if (proposalType === "incentive") {
                const logs: any[] = parseEventLogs({
                    abi: ProgramFactoryABI,
                    eventName: 'ProgramCreated',
                    logs: receipt.logs,
                });


                if (logs.length > 0) {
                    const { programContract, rewardContract } = logs[0].args;
                    // Update proposal
                    await fetch("/api/proposal", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            status: "executed",
                            _id: proposalDBId,
                        })
                    })
                    // Save program
                    let req = await fetch("/api/program", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            creator: address,
                            title: params.title,
                            dao_address: contractAddress,
                            program_address: programContract,
                            reward_address: rewardContract,
                            dao_id: daoId,
                            proposal_id: proposalDBId,
                            params: params
                        })
                    })
                    let res = await req.json();
                    if (res.success) {
                        toast.success("The proposal was executed successful!")
                    }
                }
            } else if (proposalType === "sendfund") {
                await fetch("/api/proposal", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "executed",
                        _id: proposalDBId,
                    })
                })


                let req = await fetch("/api/fund", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        creator: address,
                        title: params.title,
                        dao_address: contractAddress,
                        dao_id: daoId,
                        proposal_id: proposalDBId,
                        params: params
                    })
                })
                let res = await req.json();
                if (res.success) {
                    toast.success("The proposal was executed successful!")
                }
            }



        } catch (err: any) {
            if (err instanceof BaseError) {
                toast.error(`Error: ${err.shortMessage}`)
            } else {
                toast.error(`Error: ${err.message}`)
            }
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <Card className="w-full mx-auto shadow-lg px-30">
            {/* <CardHeader> */}
            {/* <CardTitle className="text-xl">{proposal?.name || "Proposal"}</CardTitle> */}
            {/* </CardHeader> */}
            <CardContent className="space-y-4">
                {/* Section 1: Member info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-600">
                        Members: {memberCount?.toString() || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-600">
                        Quorum: {quorum?.toString() || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-600">
                        Threshold: {votingThreshold?.toString() || 0}
                    </Badge>
                </div>

                {/* Section 2: Vote counts */}
                <div className="flex justify-around text-center mt-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Votes For</p>
                        <p className="text-lg font-bold text-green-600">{proposal?.totalVotesFor?.toString() || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Votes Against</p>
                        <p className="text-lg font-bold text-red-600">{proposal?.totalVotesAgainst?.toString() || 0}</p>
                    </div>
                </div>

                {/* Section 3: Buttons */}
                <div className="flex justify-center gap-6 mt-4">
                    <Button
                        disabled={isVoting}
                        onClick={() => handleVote(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Support
                    </Button>
                    <Button
                        disabled={isVoting}
                        onClick={() => handleVote(false)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Against
                    </Button>

                    <Button
                        disabled={isProcessing}
                        onClick={() => handleExecuteProposal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isProcessing && <Loader2 className='animate-spin' />}
                        Execute
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
