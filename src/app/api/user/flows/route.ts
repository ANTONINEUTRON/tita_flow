import { FlowService } from "@/lib/server_services/flow_service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();
        console.log("Request Data:", requestData);
        // Extract required user ID
        const userId = requestData.userId;
        if (!userId) {
            return NextResponse.json(
                { error: "Missing required parameter: userId" },
                { status: 400 }
            );
        }
        
        // Extract optional pagination parameters with defaults
        const page = Number(requestData.page) || 1;
        const pageSize = Number(requestData.pageSize) || 20;
        
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return NextResponse.json(
                { error: "Invalid pagination parameters. Page must be >= 1 and pageSize must be between 1 and 100." },
                { status: 400 }
            );
        }
        
        const filters = requestData.filters || {};
        
        // Handle date filters if provided
        if (filters.createdAfter && typeof filters.createdAfter === 'string') {
            filters.createdAfter = new Date(filters.createdAfter);
        }
        
        if (filters.createdBefore && typeof filters.createdBefore === 'string') {
            filters.createdBefore = new Date(filters.createdBefore);
        }
        
        // Extract optional sorting parameters
        const sortBy = requestData.sortBy || 'createdAt';
        const sortOrder = requestData.sortOrder === 'asc' ? 'asc' : 'desc';
        
        // Fetch user flows with all parameters
        const result = await FlowService
            .getInstance()
            .fetchFundingFlowsByUserId(
                userId,
                page,
                pageSize,
                filters,
                sortBy,
                sortOrder
            );

        // Return the flows and pagination metadata
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching user flows:", error);
        
        // Return appropriate error response
        return NextResponse.json(
            { error: "Failed to fetch user flows", message: (error as Error).message },
            { status: 500 }
        );
    }
}
