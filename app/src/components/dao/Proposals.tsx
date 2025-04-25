'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Component, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { NewProposal } from "./NewProposal";
import { ProposalDetail } from "./ProposalDetail";
import { EyeIcon } from "lucide-react";
export const proposalType = (proposalType: string) => {
    const map: {[key: string]: any} = {
        "sendfund": <Badge className="bg-green-600">Send Fund</Badge>,
        "allowclaim": <Badge className="bg-blue-600">Allow Claim</Badge>,
        "applyprogram": <Badge className="bg-yellow-600">Apply Program</Badge>,
        "incentive": <Badge className="bg-indigo-600">New Program</Badge>,
        "updateavscontract": <Badge className="bg-violet-500">Update AVS</Badge>
    }
    return map[proposalType];
}
export const Proposals = (
    { dao_address, treasury_address, dao_id }: { dao_address: string, treasury_address: string, dao_id: string }
) => {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState(null)

    function fetchProposals() {
        setLoading(true);
        fetch('/api/proposals', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dao_id: dao_id })
        })
            .then(res => res.json())
            .then(data => {
                setProposals(data.proposals);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchProposals()
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (

        <Card >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg"></CardTitle>
                <NewProposal dao_address={dao_address} fetchProposals={fetchProposals} dao_id={dao_id} treasury_address={treasury_address} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>Duration (days)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {proposals.map((proposal) => (
                            <TableRow key={proposal._id}>
                                <TableCell key={`name-${proposal._id}`}>{proposal.params.name}</TableCell>
                                <TableCell key={`start-date-${proposal._id}`}>{new Date(proposal.created_at).toLocaleString()}</TableCell>
                                <TableCell key={`duration-${proposal._id}`}>{proposal.duration_in_days}</TableCell>
                                <TableCell>
                                    <Badge className={proposal.status === "active" ? "bg-green-500 text-gray-100" : "bg-blue-500 text-gray-100"}>
                                        {proposal.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{proposalType(proposal.proposal_type)}</TableCell>
                                <TableCell>
                                    <Button variant={"outline"} key={`button-${proposal._id}`} onClick={() => {

                                        setSelectedProposal(proposal);
                                        setOpenDialog(true);
                                    }}>
                                        
                                        <EyeIcon />
                                        
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ProposalDetail open={openDialog} setOpen={setOpenDialog} proposalDetail={selectedProposal} />
            </CardContent>
        </Card >
    )
}