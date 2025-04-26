"use client"

import AddressDisplay from "../common/AddressDisplay";
import { Separator } from "../common/Separator"
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { proposalType } from "./Proposals";
import ProposalVotingCard from "./ProposalVotingCard";


export const ProposalDetail = ({ open, setOpen, proposalDetail, fetchProposals }: { open: boolean, setOpen: (open: boolean) => void, proposalDetail: any, fetchProposals: () => void }) => {
    if (!proposalDetail) return <div className="p-4 text-gray-500"></div>;


    const fieldComponent = (key: string, value: string | number | object | string[]) => {
        console.log("Key:", key);
        let component = <>{value}</>
        if (typeof value === "string" && value.startsWith("0x")) {
            component = <AddressDisplay address={value} />
        } else if (typeof value === "object") {
            component = <>{JSON.stringify(value)}</>
        } 
        
        if (key === "whitelistedAppContracts") {
            //@ts-ignore
            component = value.map((address: string, index: number) => {
                return (
                    <AddressDisplay key={`wl-contract-${index}`} address={address} />
                )
            })
        }
        return component
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogContent className="sm:max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Proposal Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 space-y-2">
                    <div className="space-y-1">
                        <h4>Name:</h4>
                        <p className="text-sm text-gray-400">{proposalDetail?.params?.name}</p>
                    </div>
                    <div className="space-y-1">
                        <h4>Type:</h4>
                        <p className="text-sm text-gray-400">
                            {proposalType(proposalDetail?.proposal_type)}
                        </p>
                    </div>


                </div>
                <Separator title="Voting Progress" />
                <ProposalVotingCard
                    fetchProposals={fetchProposals}
                    daoId={proposalDetail?.dao_id}
                    proposalDBId={proposalDetail?._id}
                    params={proposalDetail?.params}
                    proposalId={proposalDetail?.onchain_id}
                    contractAddress={proposalDetail?.dao_address} 
                    proposalType={proposalDetail?.proposal_type}
                    creator={proposalDetail?.creator}
                    />
                <Separator title="Params" />
                <Card>
                    <CardContent>
                        <div className="grid grid-cols-2 space-y-2">
                            {
                                Object.keys(proposalDetail?.params).map((key: string, index: number) => {
                                    return (


                                        <div key={`${index}`} className="space-y-1">
                                            <h4>{key}:</h4>
                                            <div className="text-sm text-gray-400">
                                                {
                                                    fieldComponent(key, proposalDetail?.params[key])
                                                }
                                            </div>
                                        </div>

                                    )
                                }

                                )
                            }
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}