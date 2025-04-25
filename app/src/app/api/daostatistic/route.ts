import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
import Proposal from "@/database/models/proposal"
import Program from "@/database/models/program"
import App from "@/database/models/app"
import Fund from "@/database/models/fund"

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        const _id = body._id;

        const countProgram = await Program.countDocuments({ dao_id: _id });
        const countProposal = await Proposal.countDocuments({dao_id: _id});
        const countApp = await App.countDocuments({dao_id: _id});
        const countFundingReqs = await Fund.countDocuments({dao_id: _id});


     
        return NextResponse.json(
            {success: true, statistic: {programNum: countProgram, proposalNum: countProposal, appNum: countApp, fundingReqs: countFundingReqs}}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}
