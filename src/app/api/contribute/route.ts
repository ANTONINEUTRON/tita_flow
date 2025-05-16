import { NextRequest, NextResponse } from "next/server";
import { ContributeService } from "@/lib/server_services/contribute_service";
import { Contribution } from "@/lib/types/contribution";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const contributionData = await req.json();

    const contribution: Contribution = contributionData as any as Contribution;
    
    // Call service to save contribution
    await ContributeService
      .getInstance()
      .saveContribution(contribution);

    // Return the saved contribution
      return NextResponse.json({ message: "Saved" })
  } catch (error) {
    console.error("Error saving contribution:", error);
    return NextResponse.error();
  }
}
