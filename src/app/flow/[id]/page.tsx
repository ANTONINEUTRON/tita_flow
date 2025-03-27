"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  ArrowLeft,
  Coins,
  Download,
  FileText,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Users,
  Vote,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/lib/hooks/use-toast";

// Local imports
import { Flow, FlowType, NavItem } from "../../../lib/types/types";
import { fetchFlowData } from "../../../lib/data/flow_item_data";
import { FlowDetailSkeleton } from "../../../components/flow_item/FlowSkeleton";
import { FlowOverview } from "../../../components/flow_item/FlowOverview";
import { FlowSidebar } from "../../../components/flow_item/sidebar";
import { MobileFlowHeader, MobileBottomNav } from "../../../components/flow_item/mobile";

export default function FlowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");

  const flowId = params.id as string;

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const data = await fetchFlowData(flowId);
        setFlow(data);
      } catch (error) {
        console.error("Failed to load flow:", error);
        toast({
          title: "Error loading flow",
          description: "Could not load the flow details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId, toast]);

  // Actions
  const handleContribute = () => {
    router.push(`/flow/${flowId}/contribute`);
  };

  const handleApply = () => {
    router.push(`/flow/${flowId}/apply`);
  };

  const handleShareFlow = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Flow link copied to clipboard!",
    });
  };
  
  const handleNavigation = (view: string) => {
    setActiveView(view);
  };

  if (loading) {
    return <FlowDetailSkeleton />;
  }

  if (!flow) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Flow not found</AlertTitle>
          <AlertDescription>
            The flow you are looking for does not exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/app/flows">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
          </Link>
        </Button>
      </div>
    );
  }

  const progress = flow.goal ? Math.min(100, Math.round((flow.raised! / flow.goal) * 100)) : 0;
  const remainingDays = flow.endDate ?
    Math.max(0, Math.ceil((new Date(flow.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) :
    null;

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Overview", href: "overview", icon: LayoutDashboard },
    { title: "Contributors", href: "contributors", icon: Users, badge: flow.contributors?.length || 0 },
    { title: "Updates", href: "updates", icon: MessageSquare, badge: flow.updates?.length || 0 },
    { title: "Proposals", href: "proposals", icon: Vote, badge: flow.proposals?.length || 0 },
  ];

  if (flow.weightedDistribution) {
    navItems.splice(2, 0, { title: "Recipients", href: "recipients", icon: Users });
  }
  
  // For mobile nav, we'll limit to 4 items max
  const mobileNavItems = [...navItems].slice(0, 4);
  
  // Action button text based on flow type
  const actionButtonText = flow.type === FlowType.RAISE 
    ? "Contribute" 
    : "Apply";
  
  // Action handler based on flow type
  const handlePrimaryAction = flow.type === FlowType.RAISE 
    ? handleContribute 
    : handleApply;

  // Render page
  return (
    <div className="container max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center py-4 px-4">
        <Button variant="outline" size="sm" asChild className="h-9">
          <Link href="/app/flows">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShareFlow} className="h-9">
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Flow Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/flow/${flowId}/edit`)}>
                Edit Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Export Details
              </DropdownMenuItem>
              {flow.type === FlowType.RAISE && (
                <DropdownMenuItem onClick={handleContribute}>
                  <Coins className="mr-2 h-4 w-4" />
                  Contribute
                </DropdownMenuItem>
              )}
              {flow.type === FlowType.DISTRIBUTE && (
                <DropdownMenuItem onClick={handleApply}>
                  <FileText className="mr-2 h-4 w-4" />
                  Apply for Funding
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Left sidebar - desktop only */}
        <FlowSidebar
          flow={flow}
          activeView={activeView}
          navItems={navItems}
          progress={progress}
          remainingDays={remainingDays}
          onNavigate={handleNavigation}
          onContribute={handleContribute}
          onApply={handleApply}
        />

        {/* Mobile title and progress */}
        <MobileFlowHeader 
          flow={flow}
          progress={progress}
          remainingDays={remainingDays}
        />

        {/* Main content area */}
        <div className="flex-1">
          {/* Overview content */}
          {activeView === "overview" && (
            <FlowOverview 
              flow={flow} 
              onViewMilestones={() => setActiveView("milestones")} 
              onViewRecipients={() => setActiveView("recipients")} 
            />
          )}
          
          {/* Other views would be rendered here */}
          {/* Contributors, Recipients, Updates, Proposals */}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        flowType={flow.type}
        actionButtonText={actionButtonText}
        mobileNavItems={mobileNavItems}
        activeView={activeView}
        onNavigate={handleNavigation}
        onAction={handlePrimaryAction}
      />
    </div>
  );
}