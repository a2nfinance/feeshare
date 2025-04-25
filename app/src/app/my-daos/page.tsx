'use client';

import { useEffect, useState } from 'react';

import { DAOItem } from '@/components/dao/DAOItem';
import { Separator } from '@/components/ui/separator';
import { useAccount } from 'wagmi';


type DAO = {
    _id: string;
    creator: string;
    dao_address: string;
    treasury_address: string;
    params: any;
    created_at: any;
};

export default function MyDAOsPage() {
    const {address} = useAccount()
    const [daos, setDaos] = useState<DAO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(
            '/api/mydaos',
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({creator: address ?? "0x0"})
            }
        
        )
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
                <h4 className="uppercase hover:animate-pulse">MY ORGANIZATIONS</h4>
                <p className="text-gray-400 mb-4">All decisions are made on-chain with full transparency. A DAO can be used to manage unlimited incentive programs and whitelisted applications.</p>
                <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {daos.map((dao: DAO, index: number) => (
                    //bg-gradient-to-r to-indigo-600 from-blue-600 hover:animate-pulse
                    <DAOItem key={`dao-${index}`} dao={dao} />
                ))}
            </div>
        </div>
    );
}
