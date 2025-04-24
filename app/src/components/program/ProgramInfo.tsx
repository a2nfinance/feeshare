"use client"

import AddressDisplay from "../common/AddressDisplay"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { ApplyToProgram } from "./ApplyToProgram"

export const ProgramInfo = ({ dao, program }: { dao: any, program: any }) => {
    return (<Card className="md:col-span-1">
        <CardHeader>
            <CardTitle>Program Information</CardTitle>
            {/* <CardDescription>{dao.params.daoDescription}</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
            <Separator />

            <div className="space-y-1">
                <h4>Organization Name:</h4>
                <div className="text-sm text-gray-400">
                    {
                        dao.params.daoName
                    }
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
                    <h4>DAO Address:</h4>
                    <div className="text-sm text-gray-400">
                        <AddressDisplay address={dao.dao_address} />
                    </div>
                </div>
                <div className="space-y-1">
                    <h4>Treasury Address:</h4>
                    <div className="text-sm text-gray-400">
                        <AddressDisplay address={dao.treasury_address} />
                    </div>
                </div>
            </div>

            <Separator />
            <div className="space-y-1">
                <h4>Program Title:</h4>
                <div className="text-sm text-gray-400">
                    {program.title}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 space-x-2">


                <div className="space-y-1">
                    <h4>Reward Type:</h4>
                    <div className="text-sm text-gray-400">
                        {program.params?.rewardType}
                    </div>
                </div>

                {
                    program.params?.rewardType === "fixed" && <div className="space-y-1">
                        <h4>Reward Percentage:</h4>
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
            <Separator />
            <ApplyToProgram dao_address={dao.dao_address} reward_address={program.reward_address} program_address={program.program_address} dao_id={dao._id} />


        </CardContent>
    </Card>
    )
}