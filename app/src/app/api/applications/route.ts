import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
import App from "@/database/models/app"

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        let objs = await App.find({program_address: body.program_address}).sort({"created_at": "desc"});

     
        return NextResponse.json(
            {success: true, apps: objs}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}

