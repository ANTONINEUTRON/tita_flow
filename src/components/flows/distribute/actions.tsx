import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Clock, Edit, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { FlowStatus, DistributeFlow } from "@/lib/types/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface DistributeFlowActionsProps {
  flow: DistributeFlow;
  progress: number;
  remainingDays: number | null;
  isCreator: boolean;
  hasApplied: boolean;
  onPrimaryAction: () => void;
  actionButtonText: string;
}

export default function DistributeFlowActions({
  flow,
  progress,
  remainingDays,
  isCreator,
  hasApplied,
  onPrimaryAction,
  actionButtonText
}: DistributeFlowActionsProps) {
  // Check if applications are allowed
  const canApply = flow.status === FlowStatus.ACTIVE && !hasApplied;

  return (
    <>
      {/* Primary action card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {flow.status === FlowStatus.ACTIVE ? "Distribution in Progress" : "Distribution Status"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(flow.raised, flow.currency)}</span>
              <span className="text-muted-foreground">
                {formatPercentage(progress)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Raised</span>
              <span className="text-muted-foreground">
                of {formatCurrency(flow.goal, flow.currency)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="font-medium">{flow.acceptedRecipients?.length || 0}</span>
              <span className="text-xs text-muted-foreground">Recipients</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="font-medium">{remainingDays !== null ? remainingDays : "∞"}</span>
              <span className="text-xs text-muted-foreground">
                {remainingDays !== null ? "Days left" : "No deadline"}
              </span>
            </div>
          </div>

          <Separator />

          {/* Wallet */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Treasury</span>
              <span className="font-mono text-xs truncate max-w-[180px]">
                {flow.treasuryAddress}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {isCreator ? (
            <div className="w-full space-y-2">
              <Button asChild className="w-full">
                <Link href={`/distribute/${flow.id}/manage`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Manage Flow
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/distribute/${flow.id}/applications`}>
                  Review Applications 
                  {(flow.pendingApplications ?? []).length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary/10 text-xs font-medium">
                      {flow.pendingApplications?.length ?? 0}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full"
              disabled={!canApply && !hasApplied} 
              onClick={onPrimaryAction}
              variant={hasApplied ? "outline" : "default"}
            >
              {actionButtonText}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Creator actions */}
      {isCreator && (
        <Card>
          <CardHeader>
            <CardTitle>Creator Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/distribute/${flow.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Flow
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/distribute/${flow.id}/update`}>
                Post Update
              </Link>
            </Button>
            {flow.status === FlowStatus.ACTIVE && (
              <Button variant="outline" className="w-full">
                Pause Flow
              </Button>
            )}
            {flow.status === FlowStatus.PAUSED && (
              <Button variant="outline" className="w-full">
                Resume Flow
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}