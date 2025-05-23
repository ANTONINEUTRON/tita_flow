import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppConstants } from "@/lib/app_constants";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import Image from "next/image";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import { cn, formatCurrency } from "@/lib/utils"; // Make sure you have this utility
import useFlow from "@/lib/hooks/use_flow";

interface FlowProgressProps {
  flow: FundingFlowResponse;
  progress: number;
  remainingDays: number | null;
}

export function FlowProgress({ flow, progress, remainingDays }: FlowProgressProps) {
  const [currency, setCurrency] = useState<SupportCurrency | null>(null);
  const { activeFlow, fetchFlowOC } = useFlow();

  useEffect(() => {
    const curr = AppConstants.SUPPORTEDCURRENCIES.find((c) => c.name === flow.currency);
    if (curr) setCurrency(curr);

    fetchFlowOC(flow.address!);
  }, [flow.currency]); 

  // Calculate values
  const decimals = currency?.decimals || 9;
  const raised = activeFlow ? Number(activeFlow.raised) / Math.pow(10, decimals) : 0;
  const goal = activeFlow ? Number(activeFlow.goal) / Math.pow(10, decimals) : 0;
  const progressPercentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  
  // Format values for display
  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: amount < 0.01 ? 6 : amount < 1 ? 4 : 2
    });
  };
  
  const formattedRaised = formatAmount(raised);
  const formattedGoal = formatAmount(goal);
  const currencySymbol = currency?.name || '';

  return (
    <CardContent className="pb-3">
      <div className="mb-4">
        {/* Amount raised with goal */}
        <div className="flex justify-between mb-2">
          <div className="font-light">
            <span className="font-semibold text-base">{formattedRaised}</span>
          </div>
          <div className="text-muted-foreground">
            of <span className="font-light">{formattedGoal}</span> {currencySymbol}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          ></div>
        </div>
        
        {/* Percentage display */}
        <div className="text-xs text-muted-foreground text-right mt-1">
          {progressPercentage.toFixed(1)}% complete
        </div>
      </div>
      
      {/* Rest of the component... */}
    </CardContent>
  );
}