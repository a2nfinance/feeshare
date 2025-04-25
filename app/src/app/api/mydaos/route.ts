import connectToDatabase from "@/database/connect";
import { NextRequest, NextResponse } from "next/server";
import DAO from "@/database/models/dao"

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Not found body data" },
            );
        }

        await connectToDatabase();

        const daos = await DAO.find({ creator: body.creator }).sort({ "created_at": 1 });

        return NextResponse.json(
            { success: true, daos: daos }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error },
        );
    }

}

