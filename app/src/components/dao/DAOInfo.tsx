"use client"
import DAOJSON from "@/lib/abi/DAO.json"
import { useReadContract } from "wagmi"
import AddressDisplay from "../common/AddressDisplay"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { FundTreasury } from "./FundTreasury"
const abi = DAOJSON.abi;
export const DAOInfo = ({ dao }: { dao: any }) => {

    const { data: memberCount } = useReadContract({
        address: dao.dao_address,
        abi,
        functionName: "getMemberCount",
    });
    return (
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>{dao.params.daoName}</CardTitle>
                {/* <CardDescription>{dao.params.daoDescription}</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <Separator />
                <div className="space-y-1">
                    <h4>Description:</h4>
                    <div className="text-sm text-gray-400">
                        {
                            dao.params.daoDescription
                        }
                    </div>
                </div>
                <div className="grid grid-cols-2 space-y-2">
                    <div className="space-y-1">
                        <h4>X Account:</h4>
                        <div className="text-sm text-gray-400">
                            {
                                dao.params.daoXAccount
                            }
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Discord Account:</h4>
                        <div className="text-sm text-gray-400">
                            {
                                dao.params.daoDiscordAccount
                            }
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>DAO Contract:</h4>
                        <div className="text-sm text-gray-400">
                            <AddressDisplay address={dao.dao_address} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Treasury Contract:</h4>
                        <div className="text-sm text-gray-400">
                            <AddressDisplay address={dao.treasury_address} />
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 space-y-2">
                    <div className="space-y-1">
                        <h4>Members:</h4>
                        <div className="text-sm text-gray-400">
                            {memberCount?.toString() || 0}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Quorum:</h4>
                        <div className="text-sm text-gray-400">
                            {dao.params.daoQuorum}%
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Threshold:</h4>
                        <div className="text-sm text-gray-400">
                            {dao.params.daoVotingThreshold}%
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Only members can propose:</h4>
                        <div className="text-sm text-gray-400">
                            {dao.params.daoOnlyMembersCanPropose ? "Yes" : "No"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4>Allow earlier execution:</h4>
                        <div className="text-sm text-gray-400">
                            {dao.params.daoAllowEarlierExecution ? "Yes" : "No"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4>Created Date:</h4>
                        <div className="text-sm text-gray-400">
                            {new Date(dao.created_at).toLocaleString()}
                        </div>
                    </div>

                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 space-x-2">
                    <FundTreasury dao_address={dao.dao_address} treasury_address={dao.treasury_address} />
                    <Button variant={"secondary"}>Add Member</Button>
                    <Button variant={"secondary"}>Add Token</Button>

                </div>
            </CardContent>
        </Card>
    )
}