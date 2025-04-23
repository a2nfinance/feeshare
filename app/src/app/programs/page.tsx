import { SimpleProgramInfo } from "@/components/program/SimpleProgramInfo";
import { Separator } from "@/components/ui/separator";
import connectToDatabase from "@/database/connect";
import Program from "@/database/models/program";
import { notFound } from "next/navigation";

async function getPrograms() {
    await connectToDatabase();
    const programs: any = await Program.find().lean();
    const jsonObj = programs.map((p: any) => {
        return { ...p, _id: p._id.toString() }
    })
    return jsonObj;
}
export default async function Programs() {
    const data: any = await getPrograms();
    if (!data) return notFound();

    return (
        <div>
            <div className="px-6">
                <h4 className="uppercase hover:animate-pulse">Incentive Programs</h4>
                <p className="text-gray-400 mb-4">Develop your smart contracts and submit your application to any program to earn rewards based on the generated gas fees.</p>
                <Separator />
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <SimpleProgramInfo programs={data} />
            </div>
        </div>
    );
}