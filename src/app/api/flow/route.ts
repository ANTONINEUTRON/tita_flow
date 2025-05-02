import { FlowService } from "@/lib/server_services/flow_service";
import { FundingFlow } from "@/lib/types/flow";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    try {
        let campaignId: string = req.nextUrl.searchParams.get('id') ?? "";

        // let campaigns = await SupabaseService
        //     .getInstance()
        //     .fetchFundingFlow(campaignId)

        // return NextResponse.json(campaigns[0]);
    } catch (error) {
        console.error("Error getting campaign", error);
        return NextResponse.error();
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
