import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
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

        let obj = new Fund(
            body
        )


        let savedObj = await obj.save()
     
        return NextResponse.json(
            {success: true, fundId: savedObj._id}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}
