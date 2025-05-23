import { AirdropService } from "@/lib/server_services/airdrop_service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body = await req.json();

        // Extract required parameters
        const { tokenMint, userAddress } = body;

        // Validate required parameters
        if (!tokenMint || !userAddress) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required parameters: tokenMint and userAddress are required"
                },
                { status: 400 }
            );
        }

        // Call the airdrop function
        const result = await AirdropService(userAddress, tokenMint);

        return NextResponse.json(
            {
                success: true,
                signature: result.signature
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing airdrop request:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            },
            { status: 500 }
        );
    }
}
