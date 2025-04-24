'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useRouter } from 'next/navigation';
import AddressDisplay from '@/components/common/AddressDisplay';
import { Separator } from '@/components/ui/separator';


type DAO = {
    _id: string;
    creator: string;
    dao_address: string;
    treasury_address: string;
    params: any;
    created_at: any;
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
                console.log(data.daos)
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

    return (
        <div>
            <div className="px-6">
                <h4 className="uppercase hover:animate-pulse">ORGANIZATIONS</h4>
                <p className="text-gray-400 mb-4">All decisions are made on-chain with full transparency. A DAO can be used to manage unlimited incentive programs and whitelisted applications.</p>
                <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {daos.map(dao => (
                    //bg-gradient-to-r to-indigo-600 from-blue-600 hover:animate-pulse
                    <Card key={dao._id} className="hover:shadow-lg transition-shadow duration-300 ">
                        <CardHeader>
                            <CardTitle>{dao.params.daoName}</CardTitle>
                            <CardDescription></CardDescription>
                        </CardHeader>
                        <CardContent>

                            <Separator />
                            <div className="space-y-1">
                                <h4>Description:</h4>
                                <div className="text-sm text-gray-400">
                                    {
                                        dao.params.daoDescription
                                    }
                                </div>
                            </div>
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
                            <Separator />
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => router.push(`/daos/${dao._id}`)}>
                                View Details
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
