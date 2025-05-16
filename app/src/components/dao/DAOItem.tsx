"use client"

import { useRouter } from "next/navigation"
import AddressDisplay from "../common/AddressDisplay"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"


export const DAOItem = ({ dao }: any) => {
    const router = useRouter()
    return (
        <Card key={dao._id} className="hover:shadow-lg transition-shadow duration-300 ">
            <CardHeader>
                <CardTitle>{dao.params.daoName}</CardTitle>
                <CardDescription>{ dao.params.daoDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">

                <Card className="md:col-span-1">
                    <CardContent className="space-y-2 text-sm">
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

            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/daos/${dao._id}`)}>
                    View Details
                </Button>
            </CardFooter>
        </Card>
    )
}