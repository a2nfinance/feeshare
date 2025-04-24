'use client';
import { SimpleProgramInfo } from "@/components/program/SimpleProgramInfo";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function Programs() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    function fetchPrograms() {
        setLoading(true);
        fetch('/api/programs', {
            method: "GET",
            headers: { "Content-Type": "application/json" },
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
        <div>
            <div className="px-6">
                <h4 className="uppercase hover:animate-pulse">Incentive Programs</h4>
                <p className="text-gray-400 mb-4">Develop your smart contracts and submit your application to any program to earn rewards based on the generated gas fees.</p>
                <Separator />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <SimpleProgramInfo programs={programs} />
            </div>
        </div>
    );
}