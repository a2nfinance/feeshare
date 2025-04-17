'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { NewProposal } from "./NewProposal";
import { ProposalDetail } from "./ProposalDetail";

export const Proposals = (
    { dao_address, treasury_address, dao_id }: { dao_address: string, treasury_address: string, dao_id: string }
) => {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState(null)

    useEffect(() => {
        fetch('/api/proposals', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({dao_id: dao_id})
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.proposals);
                setProposals(data.proposals);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (

        <Card className="md:col-span-2" >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Proposals</CardTitle>
                <NewProposal dao_address={dao_address} treasury_address={treasury_address} dao_id={dao_id} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Template</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {proposals.map((proposal) => (
                            <TableRow key={proposal._id}>
                                <TableCell key={`name-${proposal._id}`}>{proposal.params.name}</TableCell>
                                <TableCell>{proposal.status}</TableCell>
                                <TableCell>{proposal.proposal_type}</TableCell>
                                <TableCell>
                                    <Button key={`button-${proposal._id}`} onClick={() => {

                                        setSelectedProposal(proposal);
                                        setOpenDialog(true);
                                    }}>details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ProposalDetail open={openDialog} setOpen={setOpenDialog} proposalDetail={selectedProposal}/>
            </CardContent>
        </Card >
    )
}