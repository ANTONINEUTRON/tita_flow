import { NextRequest, NextResponse } from "next/server";
import { ContributeService } from "@/lib/server_services/contribute_service";
import { Contribution } from "@/lib/types/contribution";
import { NotificationService } from "@/lib/server_services/notification_service";
import { FlowService } from "@/lib/server_services/flow_service";
import { NotificationTypes } from "@/lib/types/notification_types";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const contributionData = await req.json();

    const contribution: Contribution = contributionData as any as Contribution;

    // Call service to save contribution
    await ContributeService
      .getInstance()
      .saveContribution(contribution);

    // Notify user
    // Fetch the flow before calling Notification service
    FlowService.getInstance().fetchFundingFlow(contribution.flow_id).then((flow) => {
      NotificationService.getInstance().saveNotification({
        user_id: flow?.users.id!,
        action_url: "/flow/" + flow?.id,
        type: NotificationTypes.NEW_CONTRIBUTION,
        is_read: false,
        metadata:{
          amount: contribution.amount.toString(),
          currency: contribution.currency,
          flowTitle: flow?.title!,
          flowId: flow?.id!
        },
        created_at: new Date().toISOString(),
      })
    })

    // Return the saved contribution
    return NextResponse.json({ message: "Saved" })
  } catch (error) {
    console.error("Error saving contribution:", error);
    return NextResponse.error();
  }
}
