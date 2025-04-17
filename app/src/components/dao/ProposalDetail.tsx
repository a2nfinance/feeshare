"use client"

import AddressDisplay from "../common/AddressDisplay";
import { Separator } from "../common/Separator"
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"


export const ProposalDetail = ({ open, setOpen, proposalDetail }: { open: boolean, setOpen: (open: boolean) => void, proposalDetail: any }) => {
    if (!proposalDetail) return <div className="p-4 text-gray-500">Loading...</div>;


    const fieldComponent = (value: string | number | object) => {
        let component = <>{value}</>
        if (typeof value === "string" && value.startsWith("0x")) {
            component = <AddressDisplay address={value} />
        } else if (typeof value === "object") {
            component = <>{JSON.stringify(value)}</>
        }
        return component
    }
    return (
        <Dialog open={open} onOpenChange={setOpen} modal={true}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Proposal Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 space-y-2">
                    <div className="space-y-1">
                        <h4>Name:</h4>
                        <p className="text-sm text-gray-400">{proposalDetail?.params?.name}</p>
                    </div>
                    <div className="space-y-1">
                        <h4>Template:</h4>
                        <p className="text-sm text-gray-400">
                            {proposalDetail?.proposal_type}
                        </p>
                    </div>


                </div>
                <Separator title="Voting Progress" />

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
                                                    fieldComponent(proposalDetail?.params[key])
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