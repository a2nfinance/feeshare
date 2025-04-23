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

        const objs = await App.find({reward_address: body.reward_address, "onchain_app_id": {$in: body.onchain_ids}}).sort({"created_at": "desc"});

     
        return NextResponse.json(
            {success: true, apps: objs}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}
