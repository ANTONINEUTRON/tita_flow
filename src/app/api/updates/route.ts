import { FlowService } from "@/lib/server_services/flow_service";
import { NotificationService } from "@/lib/server_services/notification_service";
import { UpdateService } from "@/lib/server_services/update_service";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import { NotificationTypes } from "@/lib/types/notification_types";
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


        // Notify user
        // Fetch the flow before calling Notification service
        FlowService.getInstance().fetchFundingFlow(updateObj.flow_id).then((flow: FundingFlowResponse | null) => {
            NotificationService.getInstance().saveNotification({
                user_id: flow?.users.id!,
                action_url: "/flow/" + flow?.id,
                type: NotificationTypes.NEW_UPDATE,
                metadata: {
                    flowTitle: flow?.title!,
                    flowId: flow?.id!,
                    updateId: updateObj.id,
                    creatorName: flow?.users.username!,
                    updateText: updateObj.description,
                },
                is_read: false,
                created_at: new Date().toISOString(),
            })
        })


        return NextResponse.json({ message: "Saved" })
    } catch (error) {
        console.error("Error saving update:", error);
        return NextResponse.error();
    }
}