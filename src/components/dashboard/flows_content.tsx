import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, PlusCircleIcon } from "lucide-react";
import { useEffect } from "react";
import useFlow from "@/lib/hooks/use_flow";
import useProfile from "@/lib/hooks/use_profile";
import { cn } from "@/lib/utils";
import { FundingFlow } from "@/lib/types/funding_flow";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import { AppConstants } from "@/lib/app_constants";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";

interface FlowsContentProps {
  flows: FundingFlowResponse[];
  loading: boolean;
}

export function FlowsContent({ flows, loading }: FlowsContentProps) {

  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <h2 className="text-lg font-semibold">Loading Flows...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flows.map((flow) => {
          const currency: SupportCurrency = AppConstants.SUPPORTEDCURRENCIES.find((c) => c.name === flow.currency) || AppConstants.SUPPORTEDCURRENCIES[0];

          return (
            <Card key={flow.id} className={cn(flow.status === "cancelled" ? "border-dashed" : "", "flex flex-col justify-between")}>
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{flow.title}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                  ${flow.status === "active" ? "bg-green-100 text-green-800" : ""}
                  ${flow.status === "cancelled" ? "bg-yellow-100 text-yellow-800" : ""}
                  ${flow.status === "completed" ? "bg-blue-100 text-blue-800" : ""}
                `}>
                      {flow.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{flow.description}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Raised</span>
                        <span className="font-medium">
                          {(flow.raised / Math.pow(10, currency.decimals)).toLocaleString()} of {(Number(flow.goal) / Math.pow(10, currency.decimals)).toLocaleString()} {flow.currency}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(Number(flow.raised) / Number(flow.goal)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {flow.rules.milestone && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Milestones</span>
                          <span className="font-medium">{flow.completed_milestones} of {flow.milestones?.length} completed</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{ width: `${(flow.completed_milestones! / flow.milestones?.length!) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
              <CardFooter>
                <Button variant="outline" size="lg" className="w-full " asChild>
                  <Link className="" href={`/flow/${flow.id}`}>Manage Flow</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        
        <Card className="border-dashed flex flex-col items-center justify-center h-full min-h-[220px]">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              <PlusCircleIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Create New Flow</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set up a new funding flow with customizable rules and milestones
            </p>
            <Button asChild className="mt-2">
              <Link href="/app/create">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}