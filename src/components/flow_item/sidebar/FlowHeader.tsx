import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader } from "@/components/ui/card";
import { FundingFlowResponse } from "@/lib/types/flow.response";

interface FlowHeaderProps {
  flow: FundingFlowResponse
}

export function FlowHeader({ flow }: FlowHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="space-y-1">
        {/* <CardTitle className="text-2xl font-bold truncate" title={flow.title}>
          {flow.title}
        </CardTitle> */}
        <div className="flex items-center text-muted-foreground text-sm mt-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={flow.users?.profile_pics } alt={flow.users?.username} />
            <AvatarFallback>{flow.users?.username.substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="truncate">{flow.users?.username}</span>
        </div>
      </div>
    </CardHeader>
  );
}