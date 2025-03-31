import React from "react";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Bookmark, Calendar, Clock, GanttChart, Info, Target, Trophy, Users } from "lucide-react";
import MdRenderer from "@/components/ui/md-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DistributeFlow, FlowStatus } from "@/lib/types/types";

interface DistributeFlowOverviewProps {
  flow: DistributeFlow;
  progress: number;
  remainingDays: number | null;
}

export default function DistributeFlowOverview({ 
  flow,
  progress,
  remainingDays
}: DistributeFlowOverviewProps) {
  // Determine status message and color
  const getStatusProps = () => {
    switch (flow.status) {
      case FlowStatus.ACTIVE:
        return {
          variant: "default" as const,
          text: "Active"
        };
      case FlowStatus.COMPLETED:
        return {
          variant: "secondary" as const,
          text: "Completed"
        };
      case FlowStatus.CANCELLED:
        return {
          variant: "destructive" as const,
          text: "Cancelled"
        };
      case FlowStatus.PAUSED:
        return {
          variant: "outline" as const,
          text: "Paused"
        };
      default:
        return {
          variant: "outline" as const,
          text: "Draft"
        };
    }
  };

  const statusProps = getStatusProps();

  return (
    <div className="space-y-6">
      {flow.media?.find(item => item.type === 'image') && (
        <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden">
          <Image
            src={flow.media.find(item => item.type === 'image')!.url}
            alt={flow.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">
                {formatCurrency(flow.raised, flow.currency)}
              </h3>
              <p className="text-sm text-muted-foreground">of {formatCurrency(flow.goal, flow.currency)}</p>
              <Progress value={progress} className="h-2 mt-2 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">
                {flow.acceptedRecipients?.length || 0}
              </h3>
              <p className="text-sm text-muted-foreground">Recipients</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-xl font-bold">
                {remainingDays !== null ? `${remainingDays} days` : "No deadline"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {remainingDays !== null ? "Remaining" : "Open-ended"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow status notice */}
      {flow.status !== FlowStatus.ACTIVE && (
        <Alert variant={statusProps.variant === "secondary" ? "default" : "destructive"}>
          <AlertDescription>
            {flow.status === FlowStatus.COMPLETED && "This distribution flow has been completed. No further applications are being accepted."}
            {flow.status === FlowStatus.CANCELLED && "This distribution flow has been cancelled. No further applications are being accepted."}
            {flow.status === FlowStatus.PAUSED && "This distribution flow is currently paused. Applications are temporarily not being accepted."}
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this distribution</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={statusProps.variant}>{statusProps.text}</Badge>
                {/* {flow.category && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    {flow.category}
                  </Badge>
                )} */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <MdRenderer content={flow.description} />
              </div>
            </CardContent>
          </Card>

          {/* Funding criteria */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Funding Criteria</CardTitle>
              <CardDescription>Requirements for receiving funding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <MdRenderer content={flow.fundingCriteria || "*No specific criteria provided*"} />
              </div>
            </CardContent>
          </Card> */}

          {/* Distribution rules */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Distribution Rules</CardTitle>
              <CardDescription>How funds will be distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <MdRenderer content={flow.distributionRules || "*Standard distribution rules apply*"} />
              </div>
            </CardContent>
          </Card> */}
        </div>

        <div className="space-y-6">
          {/* Creator info */}
          <Card>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={flow.creator.avatar} alt={flow.creator.name} />
                  <AvatarFallback>{flow.creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{flow.creator.name}</h4>
                  <p className="text-sm text-muted-foreground">{flow.creator.bio?.slice(0, 60) || "No bio"}{(flow.creator.bio ?? "").length > 60 ? "..." : ""}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href={`/profile/${flow.creator.username}`}>View Profile</a>
              </Button>
            </CardContent>
          </Card>

          {/* Flow details */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Start Date</span>
                  </div>
                  <span className="text-sm font-medium">{formatDate(flow.startDate)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">End Date</span>
                  </div>
                  <span className="text-sm font-medium">{flow.endDate ? formatDate(flow.endDate) : "Open-ended"}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <GanttChart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Distribution Model</span>
                  </div>
                  <span className="text-sm font-medium">flow.distributionModel || "Standard"</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Application Success</span>
                  </div>
                  <span className="text-sm font-medium">{flow.applicationSuccessRate || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p>
                  {/* {flow.applicationInfo ||  */}
                    "Submit your application with a clear explanation of your project, how much funding you're requesting, and how it aligns with this distribution's goals. Applications are reviewed by the flow creator."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}