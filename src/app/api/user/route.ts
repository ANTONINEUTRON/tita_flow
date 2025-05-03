
import { UserService } from "@/lib/server_services/user_service";
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

        console.log(userRecord)

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