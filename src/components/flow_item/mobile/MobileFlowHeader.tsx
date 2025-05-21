import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "../../../lib/utils";
import { FundingFlow } from "@/lib/types/funding_flow";
import App from "next/app";
import AppUser from "@/lib/types/user";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import { AppConstants } from "@/lib/app_constants";
import Image from "next/image";
import { FundingFlowResponse } from "@/lib/types/flow.response";
import useFlow from "@/lib/hooks/use_flow";

interface MobileFlowHeaderProps {
  flow: FundingFlowResponse;
  creator: AppUser | null;
  progress: number;
  remainingDays: number | null;
}

export function MobileFlowHeader({
  flow,
  creator,
  progress,
  remainingDays,
}: MobileFlowHeaderProps) {
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
    <div className="block md:hidden w-full mb-4 px-1">
      <h1 className="text-2xl font-bold truncate mb-1">{flow.title}</h1>
      <div className="flex items-center justify-between">
        <Badge className="mb-2">{flow.status}</Badge>
        <div className="flex items-center text-muted-foreground text-xs">
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage src={creator?.profile_pics} alt={creator?.name} />
            <AvatarFallback>{creator?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{creator?.username}</span>
        </div>
      </div>

      {/* Mobile progress for Raise Flow */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1 text-sm">
          <div className="font-semibold">
            {formattedRaised}
          </div>
          <div className="text-muted-foreground text-xs">
            of {formattedGoal}  {currencySymbol}
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-muted-foreground">{progressPercentage}% completed</div>
          {remainingDays !== null && (
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {remainingDays} days left
            </div>
          )}
        </div>

      </div>
    </div>
  );
}