"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DAOJSON from "@/lib/abi/DAO.json";
import ProgramFactoryJSON from "@/lib/abi/ProgramFactory.json";
import ProgramJSON from "@/lib/abi/Program.json";
import { config } from "@/lib/wagmi";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BaseError, parseEventLogs } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

const abi = DAOJSON.abi;
const ProgramFactoryABI = ProgramFactoryJSON.abi;
const ProgramABI = ProgramJSON.abi;

type ProposalVotingCardProps = {
    proposalDBId: string,
    params: any,
    proposalId: number;
    contractAddress: `0x${string}`;
    daoId: string,
    proposalType: string,
    creator?: `0x${string}`
};

export default function ProposalVotingCard({ proposalDBId, params, proposalId, contractAddress, daoId, proposalType, creator }: ProposalVotingCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { address, chainId } = useAccount()
    const { data: dt, refetch}: { data: any, refetch: any, isLoading: boolean, error: any } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "getVotingStatus",
        args: [proposalId]
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
            await refetch()
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


            await fetch("/api/proposal", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "executed",
                    _id: proposalDBId,
                })
            })

            if (proposalType === "incentive") {
                const logs: any[] = parseEventLogs({
                    abi: ProgramFactoryABI,
                    eventName: 'ProgramCreated',
                    logs: receipt.logs,
                });

                if (logs.length > 0) {
                    const { programContract, rewardContract } = logs[0].args;
                    // Save program
                    const req = await fetch("/api/program", {
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
                    const res = await req.json();
                    if (res.success) {
                        toast.success("The proposal was executed successful!")
                    }
                }
            } else if (proposalType === "sendfund") {

                const req = await fetch("/api/fund", {
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
                const res = await req.json();
                if (res.success) {
                    toast.success("The proposal was executed successful!")
                }
            } else if (proposalType === "applyprogram") {
                const logs: any[] = parseEventLogs({
                    abi: ProgramABI,
                    eventName: 'WhitelistedAppContractsAdded',
                    logs: receipt.logs,
                });
                if (logs.length > 0) {
                    const { appId } = logs[0].args;

                    const req = await fetch("/api/application", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            creator: creator,
                            onchain_app_id: parseInt(appId),
                            application_name: params.applicationName,
                            program_address: params.targetContract,
                            reward_address: params.reward_address,
                            dao_address: contractAddress,
                            dao_id: daoId,
                            proposal_id: proposalDBId,
                            params: params
                        })
                    })
                    const res = await req.json();
                    if (res.success) {
                        toast.success("The proposal was executed successful!")
                    }
                }
            }


            await refetch()
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
            <CardContent className="space-y-4">
                {/* Section 1: Member info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-600">
                        Members: {dt?.[0]?.toString() || 0}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-600">
                        Quorum: {parseInt(dt?.[1]?.toString() || 0) / 100}%
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-600">
                        Threshold: {parseInt(dt?.[2]?.toString() || 0) / 100}%
                    </Badge>
                </div>

                {/* Section 2: Vote counts */}
                <div className="flex justify-around text-center mt-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Votes For</p>
                        <p className="text-lg font-bold text-green-600">{dt?.[3]?.totalVotesFor?.toString() || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Votes Against</p>
                        <p className="text-lg font-bold text-red-600">{dt?.[3]?.totalVotesAgainst?.toString() || 0}</p>
                    </div>
                </div>

                {/* Section 3: Buttons */}
                <div className="flex justify-center gap-6 mt-4">
                    <Button
                        disabled={isVoting || dt?.[3]?.executed}
                        onClick={() => handleVote(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Support
                    </Button>
                    <Button
                        disabled={isVoting || dt?.[3]?.executed}
                        onClick={() => handleVote(false)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Against
                    </Button>

                    <Button
                        disabled={isProcessing || !dt?.[4] || dt?.[3]?.executed}
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
