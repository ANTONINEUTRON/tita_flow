import { UpdateService } from "@/lib/server_services/update_service";
import { Update } from "@/lib/types/update";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        let flowId = req.nextUrl.searchParams.get('id');

        console.log("Campaign id", flowId)

        let updates = await UpdateService
            .getInstance()
            .fetchUpdates(flowId!)

        return NextResponse.json(updates);
    } catch (error) {
        console.error("Error fetching flow", error);
        return NextResponse.error();
    }
}

export async function POST(req: NextRequest) {
    const formData = await req.json();
    try {
        const updateObj: Update = formData as any as Update;

        await UpdateService
            .getInstance()
            .saveUpdateToDB(updateObj);

        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error saving update:", error);
        return NextResponse.error();
    }
}