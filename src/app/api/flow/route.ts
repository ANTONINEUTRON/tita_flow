import { FlowService } from "@/lib/server_services/flow_service";
import { NotificationService } from "@/lib/server_services/notification_service";
import { FundingFlow } from "@/lib/types/funding_flow";
import { NotificationTypes } from "@/lib/types/notification_types";
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

        const flowService = FlowService
            .getInstance();
        await flowService
            .createFundingFlow(fundingFlowObject);


        // Notify user
        NotificationService.getInstance().saveNotification({
            user_id: fundingFlowObject?.creator_id,
            action_url: "/flow/" + fundingFlowObject?.id,
            type: NotificationTypes.FLOW_CREATED,
            is_read: false,
            metadata: {
                goalAmount: fundingFlowObject?.goal,
                currency: fundingFlowObject?.currency,
                flowTitle: fundingFlowObject?.title,
                flowId: fundingFlowObject?.id
            },
            created_at: new Date().toISOString(),
        })


        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error uploading media:", error);
        return NextResponse.error();
    }
}
