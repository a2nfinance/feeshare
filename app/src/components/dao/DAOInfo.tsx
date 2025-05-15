"use client"
import DAOJSON from "@/lib/abi/DAO.json"
import { useAccount, useBalance, useReadContract } from "wagmi"
import AddressDisplay from "../common/AddressDisplay"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { FundTreasury } from "./FundTreasury"
import { useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { formatEther } from "viem"
const abi = DAOJSON.abi;
export const DAOInfo = ({ dao }: { dao: any }) => {
    const { address, chainId } = useAccount()
    const [statistic, setStatistic] = useState<{ proposalNum: number, programNum: number, appNum: number, fundingReqs: number }>({ proposalNum: 0, programNum: 0, appNum: 0, fundingReqs: 0 });
    const [loading, setLoading] = useState<boolean>(false)
    const {data: memberCount}: { data: any, refetch: any, isLoading: boolean, error: any } = useReadContract({
        address: dao.dao_address,
        abi,
        functionName: "getMemberCount",
        chainId: chainId || 1924
    });

    const { data: balance } = useBalance({
        address: dao.treasury_address,
        chainId: chainId || 1924
    })

    function fetchStatistic() {
        setLoading(true);
        fetch('/api/daostatistic', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: dao._id })
        })
            .then(res => res.json())
            .then(data => {
                setStatistic(data.statistic);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchStatistic()
    }, [])
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
                <div className="grid grid-cols-2 space-y-2">
                    <div className="space-y-1">
                        <h4>Proposals:</h4>
                        <div className="text-sm text-gray-400">
                            {statistic.proposalNum}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Programs:</h4>
                        <div className="text-sm text-gray-400">
                            {statistic.programNum}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Approved Apps:</h4>
                        <div className="text-sm text-gray-400">
                            {statistic.proposalNum}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4>Funding Requests:</h4>
                        <div className="text-sm text-gray-400">
                            {statistic.fundingReqs}
                        </div>
                    </div>
                </div>
                <Separator />

                <Badge className="bg-green-600 w-full text-center">
                    Treasury Balance: <br/>
                    {
                        // @ts-ignore
                        formatEther(balance?.value || "0")
                    } ETH
                </Badge>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 space-x-2">
                    <FundTreasury dao_address={dao.dao_address} treasury_address={dao.treasury_address} />
                    <Button variant={"secondary"} disabled={!address || (address !== dao.creator)}>Add Member</Button>
                    <Button variant={"secondary"} disabled={!address || (address !== dao.creator)}>Add Token</Button>

                </div>
            </CardContent>
        </Card>
    )
}