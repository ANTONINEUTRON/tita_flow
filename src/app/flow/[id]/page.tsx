"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  ArrowLeft,
  Download,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Users,
  Vote,
  LucideIcon,
  MoreHorizontal,
  Loader2,
  Sparkles,
  InfoIcon,
  Edit2Icon,
  ShieldCheckIcon,
  UserIcon,
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
import { FlowDetailSkeleton } from "../../../components/flow_item/flow_skeleton";
import { FlowOverview } from "../../../components/flow_item/flow_overview";
import { FlowSidebar } from "../../../components/flow_item/sidebar";
import { MobileFlowHeader, MobileBottomNav } from "../../../components/flow_item/mobile";
import { ContributorsView } from "@/components/flow_item/contribute/contributors_view";
import { UpdatesView } from "@/components/flow_item/updates_view";
import { ProposalsView } from "@/components/flow_item/proposals_view";
import useFlow from "@/lib/hooks/use_flow";
import toast from "react-hot-toast";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import useProfile from "@/lib/hooks/use_profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ContributeDialog } from "@/components/flow_item/contribute/contribute_dialog";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import { AppConstants } from "@/lib/app_constants";
import useContribute from "@/lib/hooks/use_contribute";
import { FundingFlow } from "@/lib/types/funding_flow";
import useUpdates from "@/lib/hooks/use_updates";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  highlight?: boolean;
}

export default function FlowDetailPage() {
  const params = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const [flow, setFlow] = useState<FundingFlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const { userProfile, signUserIn, walletInstance, supportedCurrenciesBalances } = useProfile();
  const flowId = params.id as string;
  const { getFlowById, fetchFlowOC, activeFlowOnchainData } = useFlow();
  const { contribute, contributing } = useContribute();
  const { updates, fetchUpdates, loading: updateLoading } = useUpdates();

  useEffect(() => {
    const loadFlowData = async () => {
      // Reset loading state when component mounts
      setLoading(true);

      try {
        let flowDetail = await getFlowById(flowId);
        setFlow(flowDetail);
        if (flowDetail) document.title = `${flowDetail!.title} | Titaflow`;
        fetchFlowOC(flowDetail?.address!);
        // fetch updates
        fetchUpdates(flowId);
      } catch (error) {

        console.error("Failed to load flow:", error);
        toast.error("Could not load the flow details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadFlowData();
  }, [flowId]);

  // Watch for userProfile changes
  useEffect(() => {
    // If user has successfully signed in and we were waiting for it
    if (userProfile && isSigningIn) {
      setIsSigningIn(false); // Reset loading state
      setSignInDialogOpen(false); // Close sign in dialog
      setDialogOpen(true); // Open contribute dialog
    }
  }, [userProfile, isSigningIn]);

  const handleShareFlow = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Flow link copied to clipboard!");
  };

  const handleNavigation = (view: string) => {
    setActiveView(view);
  };

  const handleCreateProposal = async (title: string, description: string, options: string[], endDate: string): Promise<void> => {
    // Logic for creating a proposal
    toast.success("Currently working on this feature! Stay tuned.");
  };

  const handleVoteOnProposal = async (proposalId: string, optionId: string): Promise<void> => {
    // Logic for voting on a proposal
    toast.success("Currently working on this feature! Stay tuned.");
  };

  const handleContributeClick = () => {
    if (userProfile) {
      setDialogOpen(true);
    } else {
      setSignInDialogOpen(true);
    }
  };

  const handleDialogContribute = async (amount: number, token: SupportCurrency) => {
    const parsed = amount;
    if (!isNaN(parsed) && parsed > 0) {
      // call contribute function to sign transaction and debit user wallet
      try {
        setDialogOpen(false);

        await contribute(
          amount, userProfile!, flow as any as FundingFlow, walletInstance!,
        )

        fetchFlowOC(flow?.address!);
      } catch (error) {
        console.error("Contribution failed:", error);
        toast.error("Contribution failed. Please try again.");
      }

    }
  };


  const handleSignIn = async () => {
    setIsSigningIn(true); // Set loading state
    try {
      setSignInDialogOpen(false)
      await signUserIn();
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsSigningIn(false);
      toast.error("Sign in failed. Please try again.");
    }
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
          <Link href="/app/dashboard">
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
        <div>
          {
            userProfile && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="h-9">
                  <Link href="/app/dashboard?tab=flows">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Flows
                  </Link>
                </Button>
                <Card className="flex items-center p-1 hover:bg-accent transition-colors rounded-full cursor-pointer">
                  <Link href={`/app/dashboard?tab=settings`} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={userProfile.profile_pics || ""} alt={userProfile.username || "Creator"} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Card>
              </div>
            )
          }
          {
            isSigningIn && (
              <div className="flex gap-1 items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p className="hidden md:inline-flex">Signing In...</p>
              </div>
            )
          }
        </div>
        <div className="flex items-center gap-2">
          {/* Premium AI Assistant Button with Animation */}
          <Button
            onClick={() => setAgentDialogOpen(true)}
            className="h-9 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 text-white border-0 hover:shadow-lg transition-all duration-300 group"
            size="sm">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>

            {/* Button content */}
            <div className="relative flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-white animate-pulse" />
              <span className="hidden sm:inline font-medium">AI Assistant</span>
            </div>
          </Button>
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
              {flow?.address && (
                <Link href={`https://solscan.io/address/${flow.address}`} target="_blank" rel="noopener noreferrer">
                  <DropdownMenuItem>
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Verify
                  </DropdownMenuItem>
                </Link>

              )}
              <DropdownMenuItem onClick={() => router.push(`/flow/${flowId}/edit`)}>
                <Edit2Icon className="mr-2 h-4 w-4" />
                Edit Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Export Details
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
          isSignedIn={!!userProfile}
          canContribute={userProfile?.wallet !== flow.creator}
          isLoading={contributing}
          activeFlowOnchainData={activeFlowOnchainData}
          onNavigate={handleNavigation}
          handleContributeClick={handleContributeClick} />

        {/* Mobile title and progress */}
        <MobileFlowHeader
          flow={flow}
          activeFlowOnchainData={activeFlowOnchainData}
          remainingDays={remainingDays} />

        {/* Contribute dialog */}
        <ContributeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedToken={flow.currency}
          userBalance={supportedCurrenciesBalances[AppConstants.SUPPORTEDCURRENCIES.findIndex(curr => curr.name === flow.currency)]}
          onContribute={handleDialogContribute}
        />

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

          {/* Updates view */}
          {activeView === "updates" && (
            userProfile ? (
              <UpdatesView
                flow={flow}
                currentUser={userProfile}
                updates={updates}
                refreshUpdates={fetchUpdates}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Please sign in to view updates.</p>
              </div>
            )
          )}

          {/* Proposals view */}
          {activeView === "proposals" && (
            userProfile ? (
              <ProposalsView
                flow={flow}
                currentUser={currentUser}
                onCreateProposal={handleCreateProposal}
                onVote={handleVoteOnProposal}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Please sign in to view proposals.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        mobileNavItems={mobileNavItems}
        activeView={activeView}
        onNavigate={handleNavigation}
        onAction={handleContributeClick}
        isSignedIn={!!userProfile}
        isLoading={contributing}
        canContribute={userProfile?.wallet !== flow.creator}
      />

      {/* Sign-in Dialog */}
      <Dialog open={signInDialogOpen} onOpenChange={(open) => !isSigningIn && setSignInDialogOpen(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to sign in before you can contribute to this funding flow.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSignInDialogOpen(false)}
              disabled={isSigningIn}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Meet Leah, Your Project Guide
            </DialogTitle>
            <DialogDescription>
              Your personal project assistant with answers to all your questions.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <p>
                Leah AI is designed to help you understand this project better by:
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>Answering questions about project goals and milestones</li>
                <li>Providing context on updates and progress</li>
                <li>Explaining technical aspects in simple terms</li>
                <li>Summarizing key information for quick understanding</li>
              </ul>

              <div className="bg-muted p-4 rounded-md flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <InfoIcon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm">
                  <strong>Coming Soon:</strong> We're currently teaching Leah everything about this project. She'll be ready to assist you in the next update!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setAgentDialogOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

