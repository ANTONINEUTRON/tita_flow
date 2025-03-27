import React from "react";
import { ChevronRight, Clock, Coins, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { Flow, FlowType, NavItem } from "../../../lib/types/types";
import { formatCurrency } from "../../../lib/utils";
import { FlowHeader } from "./FlowHeader";
import { FlowProgress } from "./FlowProgress";
import { SidebarNavigation } from "./SidebarNavigation";

interface FlowSidebarProps {
  flow: Flow;
  activeView: string;
  navItems: NavItem[];
  progress: number;
  remainingDays: number | null;
  onNavigate: (view: string) => void;
  onContribute: () => void;
  onApply: () => void;
}

export function FlowSidebar({
  flow,
  activeView,
  navItems,
  progress,
  remainingDays,
  onNavigate,
  onContribute,
  onApply
}: FlowSidebarProps) {
  return (
    <div className="hidden md:block md:w-64 flex-shrink-0">
      <Card className="sticky top-4">
        <FlowHeader flow={flow} />

        {/* Progress for Raise Flow */}
        {flow.type === FlowType.RAISE && flow.goal && (
          <FlowProgress 
            flow={flow}
            progress={progress}
            remainingDays={remainingDays}
          />
        )}

        <CardContent className="pt-0">
          <Separator className="my-3" />
          <SidebarNavigation 
            navItems={navItems}
            activeView={activeView}
            onNavigate={onNavigate}
          />
        </CardContent>

        <CardFooter>
          {flow.type === FlowType.RAISE ? (
            <Button className="w-full" onClick={onContribute}>
              <Coins className="mr-2 h-4 w-4" />
              Contribute to Flow
            </Button>
          ) : (
            <Button className="w-full" onClick={onApply}>
              <FileText className="mr-2 h-4 w-4" />
              Apply for Funding
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}