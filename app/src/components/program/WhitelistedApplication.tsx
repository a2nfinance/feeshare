"use client"
import { useEffect, useState } from "react";
import AddressDisplay from "../common/AddressDisplay";
import NoData from "../common/NoData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import RewardJSON from "@/lib/abi/Reward.json";
import { RewardDisplay } from "../common/RewardDisplay";
import { Separator } from "../ui/separator";
const abi = RewardJSON.abi;
export const WhitelistedApplication = ({ program }: { program: any }) => {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    function fetchApps() {
        setLoading(true);
        fetch('/api/applications', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ program_address: program.program_address })
        })
            .then(res => res.json())
            .then(data => {
                setApps(data.apps);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchApps()
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
    return (
        <div className="md:col-span-2">
            <div className="px-6">
                <h4 className="uppercase hover:animate-pulse">Whitelisted Apps</h4>
                <p className="text-gray-400 mb-4">Approved applications will receive rewards based on a portion of the total gas fees generated by their smart contracts.</p>
                <Separator />
            </div>
            <div className="p-6">
                {apps.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {apps.map((app, index) => {
                        return (
                            <Card key={`application-${index}`} className="hover:shadow-lg transition-shadow duration-300 ">
                                <CardHeader>
                                    <CardTitle>{app.application_name}</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <Separator />
                                    <div className="grid grid-cols-1 mb-1.5 space-y-2">


                                        <div className="space-y-1 hover:cursor-pointer">
                                            <h4>Website:</h4>
                                            <div className="text-sm text-gray-400">
                                                <a onClick={() => window.open(app.params?.website, "_blank")}>{app.params?.website}</a>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h4>X Account:</h4>
                                            <div className="text-sm text-gray-400">
                                                {app.params?.xAccount}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4>Beneficiary Address:</h4>
                                            <div className="text-sm text-gray-400">
                                                <AddressDisplay address={app.params?.beneficiaryApp} />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />
                                    <RewardDisplay rewardContractAddress={program.reward_address} params={program.params} onchainAppId={app.onchain_app_id} abi={abi} />
                                </CardContent>
                            </Card>
                        )
                    })}


                </div>
                }
                {apps.length === 0 && <NoData message="There are no whitelisted applications in this incentive program. Be the first to get whitelisted and receive rewards!" />}
            </div>
        </div>
    )
}