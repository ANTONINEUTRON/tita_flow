import { FlowService } from "@/lib/server_services/flow_service";
import { FundingFlow } from "@/lib/types/flow";
import { NextRequest, NextResponse } from "next/server";

// fetch user flows with pagination support
export async function POST(req: NextRequest) {
    const formData = await req.json();
    try {
        const userId = (formData as any).userId;

        await FlowService
            .getInstance()
            .fetchFundingFlowsByUserId(userId);

        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error uploading media:", error);
        return NextResponse.error();
    }
}
