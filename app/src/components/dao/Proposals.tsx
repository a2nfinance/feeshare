'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { NewProposal } from "./NewProposal";
import { ProposalDetail } from "./ProposalDetail";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
        <Tabs defaultValue="proposals" className="md:col-span-2">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="proposals">Proposals</TabsTrigger>
                <TabsTrigger value="programs">Programs</TabsTrigger>
            </TabsList>
            <TabsContent value="proposals">
                <Card >
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg"></CardTitle>
                        <NewProposal dao_address={dao_address} fetchProposals={fetchProposals} dao_id={dao_id} />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Duration in Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Template</TableHead>
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
                        <ProposalDetail open={openDialog} setOpen={setOpenDialog} proposalDetail={selectedProposal} />
                    </CardContent>
                </Card >
            </TabsContent>
            <TabsContent value="programs">
                
            </TabsContent>
        </Tabs>

    )
}