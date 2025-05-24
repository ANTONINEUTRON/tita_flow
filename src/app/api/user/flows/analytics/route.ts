import { ContributeService } from "@/lib/server_services/contribute_service";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { userId } = await req.json();

    // Call service to get contributions analytics
    const contributionsAnalytics = await ContributeService
      .getInstance()
      .getContributionsAnalyticsByCreator(userId);

    // Return the contributions analytics
    return NextResponse.json(contributionsAnalytics);
  } catch (error) {
    console.error("Error fetching contributions analytics:", error);
    return NextResponse.error();
  }
}