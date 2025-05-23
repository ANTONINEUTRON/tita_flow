// app/api/notifications/mark-all-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/server_services/notification_service";

export async function POST(req: NextRequest) {
    try {
        const userId = (await req.json()).userId;
        
        await NotificationService.getInstance().markAllNotificationsAsRead(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.error();
    }
}