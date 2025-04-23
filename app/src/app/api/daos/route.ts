import connectToDatabase from "@/database/connect";
import { NextResponse } from "next/server";
import DAO from "@/database/models/dao"

export async function GET() {

    try {
        await connectToDatabase();

        const daos = await DAO.find().sort({"created_at": 1});
     
        return NextResponse.json(
            {success: true, daos: daos}
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : error},
        );
    }
    
}