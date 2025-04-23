'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";

export const Programs = (
    { dao_address, treasury_address, dao_id }: { dao_address: string, treasury_address: string, dao_id: string }
) => {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    function fetchPrograms() {
        setLoading(true);
        fetch('/api/programs', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dao_id: dao_id })
        })
            .then(res => res.json())
            .then(data => {
                setPrograms(data.programs);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchPrograms()
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
                            <TableHead>Title</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Reward Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programs.map((program) => (
                            <TableRow key={program._id}>
                                <TableCell key={`name-${program._id}`}>{program.params?.title}</TableCell>
                                <TableCell key={`start-date-${program._id}`}>{new Date(program.params?.startDate).toLocaleString()}</TableCell>
                                <TableCell key={`end-date-${program._id}`}>{new Date(program.params?.endDate).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge className={"bg-green-500 text-gray-100"}>
                                        {program.params?.rewardType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Link key={`button-${program._id}`} href={`/programs/${program._id}`}>details</Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card >


    )
}