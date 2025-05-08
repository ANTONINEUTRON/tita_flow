import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "../../../lib/utils";
import { FundingFlow } from "@/lib/types/flow";
import App from "next/app";
import AppUser from "@/lib/types/user";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import { AppConstants } from "@/lib/app_constants";
import Image from "next/image";
import { FundingFlowResponse } from "@/lib/types/flow.response";

interface MobileFlowHeaderProps {
  flow: FundingFlowResponse;
  creator: AppUser | null;
  progress: number;
  remainingDays: number | null;
}

export function MobileFlowHeader({ flow, creator, progress, remainingDays }: MobileFlowHeaderProps) {
  const [currency, setCurrency] = useState<SupportCurrency | null>(null);

  useEffect(() => {
    const curr = AppConstants.SUPPORTEDCURRENCIES.find((c) => c.name === flow.currency);
    setCurrency(curr!)
  });

  return (
    <div className="block md:hidden w-full mb-4 px-1">
      <h1 className="text-2xl font-bold truncate mb-1">{flow.title}</h1>
      <div className="flex items-center justify-between">
        <Badge className="mb-2">{flow.status}</Badge>
        <div className="flex items-center text-muted-foreground text-xs">
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage src={creator?.profilePics} alt={creator?.name} />
            <AvatarFallback>{creator?.username.substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{creator?.username}</span>
        </div>
      </div>
      
      {/* Mobile progress for Raise Flow */}
      <div className="mt-2">
        <div className="flex justify-between mb-1 text-sm">
          <Image src={currency?.logo!} alt={currency?.name!} width={40} height={40}/>
          <div className="font-semibold">
            {flow.raised!}
          </div>
          <div className="text-muted-foreground text-xs">
            {progress}% of {flow.goal}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        {remainingDays !== null && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {remainingDays} days remaining
          </div>
        )}
      </div>
    </div>
  );
}