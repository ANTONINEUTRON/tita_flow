"use client";

import { useState, useEffect, useCallback } from "react";
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
  Share2,
  Users,
  Users2,
  Vote,
  ClipboardCheck,
  LucideIcon,
  MoreHorizontal,
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
import { Flow, FlowType, } from "../../../lib/types/types";
import { fetchFlowData } from "../../../lib/data/flow_item_data";
import { FlowDetailSkeleton } from "../../../components/flow_item/FlowSkeleton";
import { FlowOverview } from "../../../components/flow_item/FlowOverview";
import { FlowSidebar } from "../../../components/flow_item/sidebar";
import { MobileFlowHeader, MobileBottomNav } from "../../../components/flow_item/mobile";
import { ContributorsView } from "@/components/flow_item/ContributorsView";
import { UpdatesView } from "@/components/flow_item/UpdatesView";
import { ProposalsView } from "@/components/flow_item/ProposalsView";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecipientsView } from "@/components/distribute/recipients-view";
import ApplicationsView from "@/components/distribute/applications-view";

// Update the NavItem interface
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  highlight?: boolean; // Add this property
}

export default function FlowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dialogContent, setDialogContent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleViewApplication = useCallback(() => {
    if (!flow) return;
    
    // Find the user's application
    const userApplication = flow.pendingApplications?.find(
      (app) => app.applicantId === currentUser?.id
    );

    if (userApplication) {
      // Open a dialog to view the application or navigate to application detail page
      setDialogContent({
        title: "Your Application",
        content: (
          <div className="space-y-4">
            <p>
              <strong>Status:</strong> {userApplication.status}
            </p>
            <p>
              <strong>Requested Amount:</strong>{" "}
              {formatCurrency(
                userApplication.requestedAmount,
                flow.currency
              )}
            </p>
            <p>
              <strong>Submitted:</strong> {formatDate(userApplication.appliedAt)}
            </p>
            <div>
              <h4 className="font-medium mb-1">Your Proposal</h4>
              <div className="prose prose-sm max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: userApplication.proposal }}
                />
              </div>
            </div>
          </div>
        ),
      });
      setIsDialogOpen(true);
    }
  }, [flow, currentUser, setDialogContent, setIsDialogOpen]);

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

  const handleCreateUpdate = async (content: string, attachments: File[]): Promise<void> => {
    // Logic for creating an update
  };

  const handleCommentOnUpdate = async (updateId: string, content: string): Promise<void> => {
    // Logic for commenting on an update
  };

  const handleLikeUpdate = async (updateId: string): Promise<void> => {
    // Logic for liking an update
  };

  const handleCreateProposal = async (title: string, description: string, options: string[], endDate: string): Promise<void> => {
    // Logic for creating a proposal
  };

  const handleVoteOnProposal = async (proposalId: string, optionId: string): Promise<void> => {
    // Logic for voting on a proposal
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
  const remainingDays = flow.endDate
    ? Math.max(0, Math.ceil((new Date(flow.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Overview", href: "overview", icon: LayoutDashboard },
    { title: "Contributors", href: "contributors", icon: Users, badge: flow.contributors?.length || 0 },
    { title: "Updates", href: "updates", icon: MessageSquare, badge: flow.updates?.length || 0 },
    { title: "Proposals", href: "proposals", icon: Vote, badge: flow.proposals?.length || 0 },
  ];

  // Add dedicated sections for distribute flows
  // if (flow.type === FlowType.DISTRIBUTE) {
    // Add Applications tab after Recipients
    // navItems.splice(2, 0, {
    //   title: "Applications",
    //   href: "applications",
    //   icon: ClipboardCheck,
    //   badge: flow.pendingApplications?.length || 0,
    //   highlight: (flow.pendingApplications || []).length > 0 && currentUser?.isCreator, // Highlight for creators if there are pending applications
    // });
  // }
  // For Raise flows with weighted distribution, add Recipients tab
  // else if (flow.weightedDistribution) {
    // navItems.splice(2, 0, {
    //   title: "Recipients",
    //   href: "recipients",
    //   icon: Users2,
    // });
  // }

  // For mobile nav, we'll limit to 4 items max
  const mobileNavItems = [...navItems].slice(0, 4);

  // Determine if the user has applied
  const hasApplied =
    flow.type === FlowType.DISTRIBUTE &&
    flow.pendingApplications?.some((app) => app.applicantId === currentUser?.id);

  // Action button text based on flow type
  const actionButtonText =
    flow.type === FlowType.RAISE ? "Contribute" : hasApplied ? "View Application" : "Apply";

  // Action handler based on flow type
  const handlePrimaryAction =
    flow.type === FlowType.RAISE ? handleContribute : hasApplied ? handleViewApplication : handleApply;

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
        <MobileFlowHeader flow={flow} progress={progress} remainingDays={remainingDays} />

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

          {/* Contributors view */}
          {activeView === "contributors" && <ContributorsView flow={flow} />}

          {/* Recipients view DISTRIBUTE*/}
          {/* {activeView === "recipients" && (
            <RecipientsView flow={flow} isCreator={currentUser?.isCreator} />
          )} */}

          {/* Applications view DISTRIBUTE*/}
          {/* {activeView === "applications" && (
            <ApplicationsView flow={flow} isCreator={currentUser?.isCreator} />
          )} */}

          {/* Updates view */}
          {activeView === "updates" && (
            <UpdatesView
              flow={flow}
              currentUser={currentUser}
              onCreateUpdate={handleCreateUpdate}
              onComment={handleCommentOnUpdate}
              onLike={handleLikeUpdate}
            />
          )}

          {/* Proposals view */}
          {activeView === "proposals" && (
            <ProposalsView
              flow={flow}
              currentUser={currentUser}
              onCreateProposal={handleCreateProposal}
              onVote={handleVoteOnProposal}
            />
          )}
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

