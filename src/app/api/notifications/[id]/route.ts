// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/lib/server_services/notification_service";

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {        
        const notificationId = params.id;

        await NotificationService.getInstance().deleteNotification(notificationId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
            { error: "Failed to delete notification" },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        const notificationId = params.id;

        await NotificationService.getInstance().markNotificationAsRead(notificationId,);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}