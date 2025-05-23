
import { NotificationService } from "@/lib/server_services/notification_service";
import { UserService } from "@/lib/server_services/user_service";
import { NotificationTypes } from "@/lib/types/notification_types";
import AppUser from "@/lib/types/user";
import { NextRequest, NextResponse } from "next/server";

const userService = UserService.getInstance();


// This returns the user profile 
// url is /api/user?userId=[userId]
export async function GET(req: NextRequest) {
    let userId = req.nextUrl.searchParams.get('userId');
    let userEmail = req.nextUrl.searchParams.get('userEmail');

    try {
        // fetch user record from db
        const userRecord = userId
            ? await userService.getUserRecord(userId ?? "")
            : await userService.getUserRecordByEmail(userEmail ?? "");
            
        return NextResponse.json(userRecord);
    } catch (error) {
        console.log(error)
        return NextResponse.error();
    }
}

// Save the user profile
export async function POST(req: NextRequest) {
    let userProfile = await req.json() as unknown as AppUser;
    try {
        // save user record to db
        await userService.saveUserRecordToDb(userProfile);

        NotificationService.getInstance().saveNotification({
            user_id: userProfile.id,
            action_url: "/app/dashboard?tab=settings",
            type: NotificationTypes.ACCOUNT_CREATED,
            is_read: false,
            metadata: {
                username: userProfile.username,
            },
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ message: "successful" });
    } catch (error) {
        console.log(error)
        return NextResponse.error();
    }
}

// Update the user profile
export async function PUT(req: NextRequest) {
    let userProfileFields = await req.json() as any;

    try {
        await userService.updateUserRecordInDb(userProfileFields);

        return NextResponse.json({ message: "successful" });
    } catch (error) {
        return NextResponse.error();
    }
}