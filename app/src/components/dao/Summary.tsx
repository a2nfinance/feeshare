import AddressDisplay from "../common/AddressDisplay"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

export const Summary = ({ summary }: { summary: any }) => {
    return <Card className="block">
        <CardHeader>
            <CardTitle className="text-2xl">Organization Information</CardTitle>
            <CardDescription>
                Please double check organization information before your summit.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-2 text-sm">
            <Separator />
            <div className="space-y-1">
                <h4>Name:</h4>
                <div className="text-sm text-gray-400">
                    {
                        summary.daoName
                    }
                </div>
            </div>

            <div className="space-y-1">
                <h4>Description:</h4>
                <div className="text-sm text-gray-400">
                    {
                        summary.daoDescription
                    }
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 space-y-2">


                <div className="space-y-1">
                    <h4>X Account:</h4>
                    <div className="text-sm text-gray-400">
                        {
                            summary.daoXAccount
                        }
                    </div>
                </div>

                <div className="space-y-1">
                    <h4>Discord Account:</h4>
                    <div className="text-sm text-gray-400">
                        {
                            summary.daoDiscordAccount
                        }
                    </div>
                </div>

                <div className="space-y-1">
                    <h4>Voting Threshold:</h4>
                    <div className="text-sm text-gray-400">
                        {summary.daoVotingThreshold}%
                    </div>
                </div>
                <div className="space-y-1">
                    <h4>Only member can propose:</h4>
                    <div className="text-sm text-gray-400">
                        {summary.daoOnlyMembersCanPropose ? "Yes" : "No"}%
                    </div>
                </div>
                <div className="space-y-1">
                    <h4>Allow earlier execution:</h4>
                    <div className="text-sm text-gray-400">
                        {summary.daoAllowEarlierExecution ? "Yes" : "No"}
                    </div>
                </div>


            </div>
            <Separator />
            <div className="grid grid-cols-2 space-y-2">
                <div className="space-y-1">
                    <h4>Tokens:</h4>
                    <div className="text-sm text-gray-400">
                        {
                            summary.initialWhitelistedTokens.map((t: string, k: number) => {

                                return <AddressDisplay key={`whitelisted-token-${k}`} address={t} />
                            })
                        }
                    </div>
                </div>

                <div className="space-y-1">
                    <h4>Funders:</h4>
                    <div className="text-sm text-gray-400">
                        {
                            summary.initialWhitelistedFunders.map((t: string, k: number) => {

                                return <AddressDisplay key={`whitelisted-funder-${k}`} address={t} />
                            })
                        }

                    </div>
                </div>
            </div>
            <Separator />

            <div className="space-y-1">
                <h4>Members [address and weight]:</h4>
                <div className="text-sm text-gray-400">
                    {
                        summary.members.map((t: {address: string, weight: number}, k: number) => {

                            return <>
                                <AddressDisplay key={`member-${k}`} address={t.address} /> 
                                <Badge className="ml-2">{t.weight}</Badge>
                            </>
                        })
                    }

                </div>
            </div>
        </CardContent>
    </Card>
}