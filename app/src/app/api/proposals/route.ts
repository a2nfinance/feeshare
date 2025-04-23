import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
import Proposal from "@/database/models/proposal"

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        const objs = await Proposal.find({dao_id: body.dao_id}).sort({"created_at": "desc"});

     
        return NextResponse.json(
            {success: true, proposals: objs}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}

