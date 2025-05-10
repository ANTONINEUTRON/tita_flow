import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppConstants } from "@/lib/app_constants";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import Image from "next/image";
import { FundingFlowResponse } from "@/lib/types/flow.response";
import { cn, formatCurrency } from "@/lib/utils"; // Make sure you have this utility

interface FlowProgressProps {
  flow: FundingFlowResponse;
  progress: number;
  remainingDays: number | null;
}

export function FlowProgress({ flow, progress, remainingDays }: FlowProgressProps) {
  const [currency, setCurrency] = useState<SupportCurrency | null>(null);

  useEffect(() => {
    const curr = AppConstants.SUPPORTEDCURRENCIES.find((c) => c.name === flow.currency);
    if (curr) setCurrency(curr);
  }, [flow.currency]); // Add dependency to prevent infinite re-renders

  // Format values for display
  const formattedRaised = currency ?
    cn(flow.raised) : "0.00";
    
  const formattedGoal = currency ? 
    cn(flow.goal, currency!.name) : "0.00";

  return (
    <CardContent className="pb-3">
      <div className="mb-4">
        {/* Amount raised with goal */}
        <div className="flex justify-between mb-2">
          <div className="font-semibold text-base">
            {formattedRaised}
          </div>
          <div className="text-muted-foreground">
            raised of {formattedGoal}
          </div>
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-2.5" />
        
        {/* Progress percentage and time remaining */}
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <div>{progress}% Complete</div>
          {remainingDays !== null && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {remainingDays === 0 ? "Ends today" : 
               remainingDays === 1 ? "1 day left" : 
               `${remainingDays} days left`}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );
}