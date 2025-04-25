'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import AddressDisplay from "../common/AddressDisplay";
import { Badge } from "../ui/badge";


export const FundingHistory = (
    { dao_id }: { dao_id: string }
) => {
    const [funds, setFunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    function fetchFunds() {
        setLoading(true);
        fetch('/api/funds', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dao_id: dao_id })
        })
            .then(res => res.json())
            .then(data => {
                setFunds(data.funds);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchFunds()
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (

        <Card >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg"></CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Amount (ETH)</TableHead>
                            <TableHead>Receiver</TableHead>
                            <TableHead>Token Address</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {funds.map((fund) => (
                            <TableRow key={fund._id}>
                                <TableCell key={`name-${fund._id}`}>{fund.params?.amount}</TableCell>
                                <TableCell key={`receiver-${fund._id}`}><AddressDisplay address={fund.params?.receiverAddress || "0x0"} /></TableCell>
                                <TableCell key={`token-${fund._id}`}>
                                    {fund.params?.tokenAddress === "0x0000000000000000000000000000000000000000" ? <Badge className="bg-blue-500">Native</Badge> : <AddressDisplay address={fund.params?.tokenAddress} />}
                                </TableCell>
                                <TableCell key={`created-date-${fund._id}`}>{new Date(fund.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card >


    )
}