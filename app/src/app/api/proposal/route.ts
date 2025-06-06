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

        const obj = new Proposal(
            body
        )


        const savedProposal = await obj.save()
     
        return NextResponse.json(
            {success: true, proposalId: savedProposal._id}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}


export async function PUT(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        await Proposal.findByIdAndUpdate(body._id, {status: body.status})
        return NextResponse.json(
            {success: true, proposalId: body._id, status: body.status}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}

