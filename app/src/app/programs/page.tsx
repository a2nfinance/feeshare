import { SimpleProgramInfo } from "@/components/program/SimpleProgramInfo";
import connectToDatabase from "@/database/connect";
import Program from "@/database/models/program";
import { notFound } from "next/navigation";



async function getPrograms() {
    await connectToDatabase();
    const programs: any = await Program.find().lean();
    let jsonObj = programs.map((p: any) => {
        return { ...p, _id: p._id.toString() }
    })
    return jsonObj;
}
export default async function Programs() {
    const data: any = await getPrograms();
    if (!data) return notFound();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <SimpleProgramInfo programs={data} />
        </div>
    );
}