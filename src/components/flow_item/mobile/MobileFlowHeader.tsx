import React from "react";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flow } from "../../../lib/types/types";
import { formatCurrency } from "../../../lib/utils";

interface MobileFlowHeaderProps {
  flow: Flow;
  progress: number;
  remainingDays: number | null;
}

export function MobileFlowHeader({ flow, progress, remainingDays }: MobileFlowHeaderProps) {
  return (
    <div className="block md:hidden w-full mb-4 px-1">
      <h1 className="text-2xl font-bold truncate mb-1">{flow.title}</h1>
      <div className="flex items-center justify-between">
        <Badge className="mb-2">{flow.status}</Badge>
        <div className="flex items-center text-muted-foreground text-xs">
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage src={flow.creator.avatarUrl} alt={flow.creator.name} />
            <AvatarFallback>{flow.creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{flow.creator.name}</span>
        </div>
      </div>
      
      {/* Mobile progress for Raise Flow */}
      {flow.type === "raise" && flow.goal && (
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-sm">
            <div className="font-semibold">{formatCurrency(flow.raised!, flow.currencySymbol)}</div>
            <div className="text-muted-foreground text-xs">
              {progress}% of {formatCurrency(flow.goal, flow.currencySymbol)}
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
      )}
    </div>
  );
}