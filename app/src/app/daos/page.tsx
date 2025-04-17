// app/daos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

type DAO = {
    _id: string;
    creator: string;
    dao_address: string;
    treasury_address: string;
    params: any;
    createdAt: string;
};

export default function DaoListPage() {
    const router = useRouter()
    const [daos, setDaos] = useState<DAO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/daos')
            .then(res => res.json())
            .then(data => {
                setDaos(data.daos);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {daos.map(dao => (
                //bg-gradient-to-r to-indigo-600 from-blue-600 hover:animate-pulse
                <Card key={dao._id} className="hover:shadow-lg transition-shadow duration-300 ">
                    <CardHeader>
                        <CardTitle>{dao.params.daoName}</CardTitle>
                        <CardDescription>{dao.params.daoDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-2"></p>
                        <p className="text-xs text-gray-500">
                            X: <a href={`https://twitter.com/${dao.params.daoXAccount.replace("@", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500">@{dao.params.daoXAccount.replace("@", "")}
                            </a>
                        </p>
                        {/* <p className="text-xs text-gray-500">
              Discord: {dao.discordAccount}
            </p>
            <p className="text-xs text-gray-500 break-all">
              Contract: {dao.contractAddress}
            </p>
            <p className="text-xs text-gray-500 break-all">
              Treasury: {dao.treasuryAddress}
            </p> */}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push(`/dao/${dao._id}`)}>
                            <Check /> View Details
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
