"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const WhitelistedApplication = ({ program_address }: { program_address: string }) => {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedApp, setSelectedApp] = useState(null)

    function fetchProposals() {
        setLoading(true);
        fetch('/api/apps', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ program_address: program_address })
        })
            .then(res => res.json())
            .then(data => {
                setApps(data.apps);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchProposals()
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {apps.map(app => {
                return (
                    <Card className="hover:shadow-lg transition-shadow duration-300 ">
                        <CardHeader>
                            <CardTitle>{app.application_name}</CardTitle>
                            <CardDescription></CardDescription>
                        </CardHeader>
                        <CardContent>

                            <div className="grid grid-cols-1">


                                <div className="space-y-1">
                                    <h4>Website:</h4>
                                    <div className="text-sm text-gray-400">
                                        {app.params?.website}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h4>X Account:</h4>
                                    <div className="text-sm text-gray-400">
                                        {app.params?.xAccount}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4>Benificiary Address:</h4>
                                    <div className="text-sm text-gray-400">
                                        {app.params?.beneficiaryApp}
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}