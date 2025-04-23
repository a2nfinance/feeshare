import { ProgramInfo } from "@/components/program/ProgramInfo";
import { WhitelistedApplication } from "@/components/program/WhitelistedApplication";
import connectToDatabase from "@/database/connect";
import DAO from "@/database/models/dao";
import Program from "@/database/models/program";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

async function getProgramDetail(id: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const program: any = await Program.findById(id).lean();
    const dao: any = await DAO.findById(program?.dao_id).lean();

    return { dao: { ...dao, _id: dao._id.toString() }, program: { ...program, _id: program._id.toString() } };
}
export default async function ProgramDetailPage({ params }: any) {
    const { id } = await params;
    const data: any = await getProgramDetail(id);

    if (!data) return notFound();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-full">

            <ProgramInfo
                dao={data.dao}
                program={data.program} />

            <WhitelistedApplication program={data.program} />
        </div>
    );
}