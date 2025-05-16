"use client"

import Link from "next/link"
import AddressDisplay from "../common/AddressDisplay"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { ApplyToProgram } from "./ApplyToProgram"
import { Statistic } from "./Statistic"

export const ProgramInfo = ({ onChainAppIds, dao, program }: { onChainAppIds: number[], dao: any, program: any }) => {
    return (<Card className="md:col-span-1">
        <CardHeader>
            <CardTitle className="uppercase">Program Information</CardTitle>
            {/* <CardDescription>{dao.params.daoDescription}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
            <Separator />
            <Statistic rewardAddress={program.reward_address} onChainAppIds={onChainAppIds} />
            <Card className="md:col-span-1">
                <CardContent className="space-y-2 text-sm">
                    <div className="space-y-1">
                        <h4>Organization:</h4>
                        <div className="text-sm text-green-400">

                            <Link href={`/daos/${dao._id}`}>
                                {
                                    dao.params.daoName
                                }
                            </Link>
                        </div>
                    </div>
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

                </CardContent>


            </Card>



            <Card className="md:col-span-1">
                <CardContent className="space-y-2 text-sm">
                    <div className="space-y-1">
                        <h4>Program Title:</h4>
                        <div className="text-sm text-blue-500">
                            {program.title}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 space-x-2 space-y-2">


                        <div className="space-y-1">
                            <h4>Reward Type:</h4>
                            <div className="text-sm text-gray-400">
                                {program.params?.rewardType}
                            </div>
                        </div>

                        {
                            program.params?.rewardType === "fixed" && <div className="space-y-1">
                                <h4>Reward (%):</h4>
                                <div className="text-sm text-gray-400">
                                    {program.params?.fixedRewardPercentage}
                                </div>
                            </div>
                        }

                        {
                            program.params?.rewardType === "dynamic" && <div className="space-y-1">
                                <h4>Reward Percentage:</h4>
                                <div className="text-sm text-gray-400">
                                    {program.params?.rewardRules.toString()}
                                </div>
                            </div>
                        }

                        <div className="space-y-1">
                            <h4>From Date:</h4>
                            <div className="text-sm text-gray-400">
                                {new Date(program.params?.startDate).toLocaleString()}
                            </div>
                        </div>


                        <div className="space-y-1">
                            <h4>To Date:</h4>
                            <div className="text-sm text-gray-400">
                                {new Date(program.params?.endDate).toLocaleString()}
                            </div>
                        </div>


                        <div className="space-y-1">
                            <h4>Program Contract:</h4>
                            <div className="text-sm text-gray-400">
                                <AddressDisplay address={program.program_address} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4>Reward Contract:</h4>
                            <div className="text-sm text-gray-400">
                                <AddressDisplay address={program.reward_address} />
                            </div>
                        </div>


                    </div>
                </CardContent>
            </Card>

            <ApplyToProgram dao_address={dao.dao_address} reward_address={program.reward_address} program_address={program.program_address} dao_id={dao._id} />
        </CardContent>
    </Card>
    )
}