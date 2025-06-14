import React from "react";
import { ArrowDownIcon, Coins, Loader, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { NavItem } from "../../../lib/types/typesbbbb";
import { FlowHeader } from "./FlowHeader";
import { FlowProgress } from "./FlowProgress";
import { SidebarNavigation } from "./SidebarNavigation";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";

interface FlowSidebarProps {
  flow: FundingFlowResponse;
  activeView: string;
  navItems: NavItem[];
  isSignedIn: boolean;
  canContribute: boolean;
  isLoading: boolean;
  activeFlowOnchainData: any;
  handleContributeClick: () => void;
  onNavigate: (view: string) => void;
}

export function FlowSidebar({
  flow,
  activeView,
  navItems,
  activeFlowOnchainData,
  isSignedIn,
  canContribute,
  isLoading,
  onNavigate,
  handleContributeClick,
}: FlowSidebarProps) {

  return (
    <div className="hidden md:block md:w-64 flex-shrink-0">
      <Card className="sticky top-4">
        <FlowHeader flow={flow} />

        {/* Progress for Raise Flow */}
        <FlowProgress
          flow={flow}
          activeFlowOnchainData={activeFlowOnchainData}
        />

        <CardContent className="pt-0">
          <Separator className="my-3" />
          <SidebarNavigation 
            navItems={navItems}
            activeView={activeView}
            onNavigate={onNavigate}
          />
        </CardContent>

        <CardFooter>
          {
            isLoading ? (
              <div className="flex items-center text-center gap-2 justify-center h-12">
                <Loader className="animate-spin" />
                <span>processing...</span>
              </div>
            ) : (
                <Button className="w-full" onClick={handleContributeClick}>
                  {
                    isSignedIn ? (
                      canContribute ? (
                        <div className="flex items-center">
                          <Coins className="mr-2 h-4 w-4" />
                          Contribute to Flow
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ArrowDownIcon className="mr-2 h-4 w-4" />
                          Withdraw
                        </div>
                      )
                    ) : (
                      <div className="flex items-center">
                        <LogInIcon className="mr-2 h-4 w-4" />
                        Sign in to Contribute
                      </div>
                    )
                  }
                </Button>
            )
          }
        </CardFooter>
      </Card>

    </div>
  );
}
