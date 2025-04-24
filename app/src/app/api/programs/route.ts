import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
import Program from "@/database/models/program"

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        const objs = await Program.find({dao_id: body.dao_id}).sort({"created_at": "desc"});

        return NextResponse.json(
            {success: true, programs: objs}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}


export async function GET() {

    try {
       
        await connectToDatabase();

        const objs = await Program.find().sort({"created_at": "desc"});

        return NextResponse.json(
            {success: true, programs: objs}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}


