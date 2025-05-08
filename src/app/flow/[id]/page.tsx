"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  ArrowLeft,
  Coins,
  Download,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Users,
  Vote,
  LucideIcon,
  MoreHorizontal,
} from "lucide-react";
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
import { FlowDetailSkeleton } from "../../../components/flow_item/FlowSkeleton";
import { FlowOverview } from "../../../components/flow_item/FlowOverview";
import { FlowSidebar } from "../../../components/flow_item/sidebar";
import { MobileFlowHeader, MobileBottomNav } from "../../../components/flow_item/mobile";
import { ContributorsView } from "@/components/flow_item/ContributorsView";
import { UpdatesView } from "@/components/flow_item/UpdatesView";
import { ProposalsView } from "@/components/flow_item/ProposalsView";
import useFlow from "@/lib/hooks/use_flow";
import AppUser from "@/lib/types/user";
import toast from "react-hot-toast";
import { FundingFlowResponse } from "@/lib/types/flow.response";
import useProfile from "@/lib/hooks/use_profile";

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
  const [flow, setFlow] = useState<FundingFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [user, setUser] = useState<AppUser | null>(null)

  const {userProfile} = useProfile();

  const flowId = params.id as string;
  const { getFlowById } = useFlow();

  useEffect(() => {

    const loadFlowData = async () => {
      // Reset loading state when component mounts
      setLoading(true);

      try {
        // Step 1: Fetch flow data
        let flowDetail = await getFlowById(flowId);
        console.log("Flow detail:", flowDetail);
        // Step 3: Set flow data and finish loading
        setFlow(flowDetail);
      } catch (error) {

        console.error("Failed to load flow:", error);
        toast.error("Could not load the flow details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadFlowData();
  }, [flowId]);

  // Actions
  const handleContribute = () => {
    router.push(`/flow/${flowId}/contribute`);
  };

  const handleShareFlow = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Flow link copied to clipboard!");
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

  const progress = flow.goal ? Math.min(100, Math.round((flow.raised! / Number(flow.goal)) * 100)) : 0;
  const remainingDays = flow.enddate
    ? Math.max(0, Math.ceil((new Date(flow.enddate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Overview", href: "overview", icon: LayoutDashboard },
    { title: "Contributors", href: "contributors", icon: Users, },//badge: 1 || 0 },
    { title: "Updates", href: "updates", icon: MessageSquare, },//badge: 1 || 0 },
    { title: "Proposals", href: "proposals", icon: Vote, },//badge: 1 || 0 },
  ];

  // For mobile nav, we'll limit to 4 items max
  const mobileNavItems = [...navItems].slice(0, 4);

  // Render page
  return (
    <div className="container max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center py-4 px-4">
        {
          userProfile && (
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link href="/app/flows">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Flows
              </Link>
            </Button>
          )
        }
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
              <DropdownMenuItem onClick={handleContribute}>
                <Coins className="mr-2 h-4 w-4" />
                Contribute
              </DropdownMenuItem>
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
        />

        {/* Mobile title and progress */}
        <MobileFlowHeader flow={flow} creator={user} progress={progress} remainingDays={remainingDays} />

        {/* Main content area */}
        <div className="flex-1">
          {/* Overview content */}
          {activeView === "overview" && (
            <FlowOverview
              flow={flow}
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
        actionButtonText={"Contribute"}
        mobileNavItems={mobileNavItems}
        activeView={activeView}
        onNavigate={handleNavigation}
        onAction={handleContribute}
      />
    </div>
  );
}

