import { FlowService } from "@/lib/server_services/flow_service";
import { FundingFlow } from "@/lib/types/flow";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        let id: string = req.nextUrl.searchParams.get('id') ?? "";
        
        console.log("Flow ID:", id);

        if (!id) {
            return NextResponse.json(
                { error: "Flow ID is required" },
                { status: 400 }
            );
        }

        const flow = await FlowService
            .getInstance()
            .fetchFundingFlow(id);
            
        if (!flow) {
            return NextResponse.json(
                { error: "Flow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(flow);
    } catch (error) {
        console.error("Error getting flow", error);
        return NextResponse.json(
            { error: "Failed to retrieve flow data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const formData = await req.json();
    try {
        const fundingFlowObject: FundingFlow = formData as any as FundingFlow;

        await FlowService
            .getInstance()
            .createFundingFlow(fundingFlowObject);

        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error uploading media:", error);
        return NextResponse.error();
    }
}
