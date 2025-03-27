import React from "react";
import { Clock } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flow } from "../../../lib/types/types";
import { formatCurrency } from "../../../lib/utils";

interface FlowProgressProps {
  flow: Flow;
  progress: number;
  remainingDays: number | null;
}

export function FlowProgress({ flow, progress, remainingDays }: FlowProgressProps) {
  return (
    <CardContent className="pb-3">
      <div className="mb-2">
        <div className="flex justify-between mb-1 text-sm">
          <div className="font-semibold">{formatCurrency(flow.raised!, flow.currencySymbol)}</div>
          <div className="text-muted-foreground">of {formatCurrency(flow.goal!, flow.currencySymbol)}</div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <div>{progress}% Complete</div>
        {remainingDays !== null && (
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {remainingDays} days left
          </div>
        )}
      </div>
    </CardContent>
  );
}