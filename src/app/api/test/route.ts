import { FlowService } from "@/lib/server_services/flow_service";
import { UserService } from "@/lib/server_services/user_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Sample test data
    const testData = {
      status: "success",
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      data: {
        example: "test value",
        number: 42,
        boolean: true,
        nested: {
          property: "nested value"
        }
      }
    };

const userService = UserService.getInstance();
    const flow = await FlowService
                .getInstance()
      .fetchFundingFlow("afdb4e8d-1817-41be-a3c");
    console.log("Flow data:", flow);
    console.log("Flow data:", flow);
    // Return successful response
    return NextResponse.json(testData, { status: 200 });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    
    // Return error response
    return NextResponse.json(
      { error: "Something went wrong with the test endpoint" },
      { status: 500 }
    );
  }
}