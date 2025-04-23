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

        const obj = new Program(
            body
        )


        const savedObj = await obj.save()
     
        return NextResponse.json(
            {success: true, programId: savedObj._id}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}

