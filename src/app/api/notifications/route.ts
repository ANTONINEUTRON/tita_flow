import { NotificationService } from "@/lib/server_services/notification_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const userId = await req.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" }, 
                { status: 400 }
            );
        }

        const notifications = await NotificationService.getInstance().fetchUserNotifications(userId);

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = (await req.json()).userId;
        
        await NotificationService.getInstance().clearNotifications(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        return NextResponse.json(
            { error: "Failed to clear notifications" },
            { status: 500 }
        );
    }
}

