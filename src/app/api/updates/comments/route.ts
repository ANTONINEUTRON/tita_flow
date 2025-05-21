import { UpdateService } from "@/lib/server_services/update_service";
import { Comment } from "@/lib/types/comment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        let updateId = req.nextUrl.searchParams.get('id');

        console.log("Update id", updateId)

        let comments = await UpdateService
            .getInstance()
            .fetchComments(updateId!)

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments", error);
        return NextResponse.error();
    }
}

export async function POST(request: NextRequest) {
    try{
        const commentObj = await request.json();

        const comment = commentObj as any as Comment;

         await UpdateService
            .getInstance()
            .saveComment(commentObj);

        return NextResponse.json({ message: "Comment saved successfully" });
    } catch (error) {
        console.error("Error saving comment:", error);
        return NextResponse.error();
    }
}