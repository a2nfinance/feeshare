import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export const Summary = ({ summary }: { summary: any }) => {
    return <Card className="block">
        <CardHeader>
            <CardTitle className="text-2xl">DAO Information</CardTitle>
            <CardDescription>
                Please double check your DAO information
            </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-sm">
            <p><strong>Name:</strong> {summary.daoName}</p>
            <p><strong>Description:</strong> {summary.daoDescription}</p>
            <p><strong>X:</strong> {summary.daoXAccount}</p>
            <p><strong>Discord:</strong> {summary.daoDiscordAccount}</p>
            <p><strong>Quorum:</strong> {summary.daoQuorum}%</p>
            <p><strong>Threshold:</strong> {summary.daoVotingThreshold}%</p>
            <p><strong>Only member can propose:</strong> {summary.daoOnlyMembersCanPropose ? '✅' : '❌'}</p>
            <p><strong>Allow earlier execution:</strong> {summary.daoAllowEarlierExecution ? '✅' : '❌'}</p>
            <p><strong>Tokens:</strong> {summary.initialWhitelistedTokens?.join(', ')}</p>
            <p><strong>Funders:</strong> {summary.initialWhitelistedFunders?.join(', ')}</p>
        </CardContent>
    </Card>
}