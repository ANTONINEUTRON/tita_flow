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
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import useFlow from "@/lib/hooks/use_flow";
import { FlowProgress } from "../sidebar";

interface MobileFlowHeaderProps {
  flow: FundingFlowResponse;
  activeFlowOnchainData: any;
}

export function MobileFlowHeader({
  flow,
  activeFlowOnchainData
}: MobileFlowHeaderProps) {
  return (
    <div className="block md:hidden w-full ">
      {/* <h1 className="text-2xl font-bold truncate mb-1">{flow.title}</h1> */}
      <FlowProgress
        flow={flow}
        activeFlowOnchainData={activeFlowOnchainData}
      />
    </div>
  );
}