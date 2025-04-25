"use client"

import { useRouter } from "next/navigation"
import AddressDisplay from "../common/AddressDisplay"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

export const SimpleProgramInfo = ({ programs }: { programs: any[] }) => {
    const router = useRouter()
    return (
        <>
            {
                programs.map((program: any, index: number) => {
                    return <Card key={`program-${index}`} className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>{program.title}</CardTitle>
                            {/* <CardDescription>{dao.params.daoDescription}</CardDescription> */}
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 space-x-2 space-y-2">


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



                        </CardContent>
                        <CardFooter>
                        <Button className="w-full" onClick={() => router.push(`/programs/${program._id}`)}>
                            View Details
                        </Button>
                    </CardFooter>
                    </Card>
                })
            }
        </>
    )
}