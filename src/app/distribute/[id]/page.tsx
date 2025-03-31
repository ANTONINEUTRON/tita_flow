"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, MessageSquare, Share2, Users2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DistributeFlowOverview from "@/components/flows/distribute/overview";
import DistributeFlowActions from "@/components/flows/distribute/actions";
import DistributeDetailSkeleton from "@/components/skeletons/distribute-detail-skeleton";
import { Application, DistributeFlow, FlowStatus } from "@/lib/types/types";
import { useToast } from "@/lib/hooks/use-toast";
import { RecipientsView } from "@/components/distribute/recipients-view";
import { UpdatesView } from "@/components/flow_item/UpdatesView";
import ApplicationsView from "@/components/distribute/applications-view";

interface NavItem {
  title: string;
  value: string;
  icon: React.ElementType;
  badge?: number;
  highlight?: boolean;
}

// Dummy user hook
const useUser = () => {
  const dummyUser = {
    id: "user-1",
    name: "Demo User",
    username: "demouser",
    email: "demo@example.com",
    avatar: "https://avatars.githubusercontent.com/u/1234567",
    bio: "This is a dummy user for development purposes",
    createdAt: new Date().toISOString(),
    wallet: "12345...abcde"
  };

  // Set isLoading to false after a brief delay to simulate loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { user: dummyUser, isLoading };
};

// Dummy getDistributeFlow function
const getDistributeFlow = async (id: string): Promise<DistributeFlow> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    id,
    title: "Ecosystem Developer Grants",
    description: "# Ecosystem Developer Grants\n\nWe're excited to announce our new grants program aimed at supporting developers building innovative solutions on our platform.\n\n## About this Program\n\nThis grants program is designed to fund projects that enhance our ecosystem, improve user experience, or address existing challenges in our community. We're looking for creative solutions that push the boundaries of what's possible with our technology.\n\n## Focus Areas\n\n- Developer Tools & Infrastructure\n- User Interface Improvements\n- Community Engagement Solutions\n- Security Enhancements\n- Educational Resources\n\nSuccessful applications will demonstrate a clear understanding of our ecosystem, present innovative solutions to real problems, and have a well-defined roadmap for implementation.",
    // coverImage: "https://images.unsplash.com/photo-1603468620905-8de7d86b781e",
    // category: "Development",
    creator: {
      id: "user-1",
      name: "Platform Foundation",
      username: "platform",
      avatar: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
      bio: "Supporting innovative builders and creators",
    },
    createdAt: "2023-10-08T16:30:00Z",
    status: FlowStatus.ACTIVE,
    startDate: "2023-10-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    goal: 100000,
    raised: 75000,
    currency: "USDC",
    currencySymbol: "$",
    treasuryAddress: "abc123...xyz789",
    // distributionModel: "Merit-based allocation",
    // applicationInfo: "Submit a detailed proposal including project overview, timeline, requested funding amount, and expected impact on the ecosystem.",
    // fundingCriteria: "# Funding Criteria\n\n- **Innovation**: How unique and innovative is your approach?\n- **Impact**: What problem does it solve and how significant is that problem?\n- **Feasibility**: Can you realistically deliver what you promise?\n- **Team**: Do you have the expertise to execute successfully?\n- **Sustainability**: How will your project sustain itself beyond the initial funding?\n\nProjects will be evaluated based on these criteria by our review committee.",
    // distributionRules: "# Distribution Rules\n\n- Funds will be distributed in installments based on milestone achievement\n- Initial payment of 20% upon acceptance\n- Four subsequent payments of 20% each upon completion of pre-defined milestones\n- All milestones must be documented and reviewed by our team\n- Recipients must provide regular updates on progress\n- Failure to meet milestones may result in adjustment or cancellation of future payments",
    applicationSuccessRate: 25,
    pendingApplications: [
      {
        id: "app-1",
        flowId: id,
        applicantId: "user-2",
        applicantName: "DevTeam Alpha",
        applicantWallet: "def456...ghi789",
        applicantAvatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
        summary: "Building an integrated development environment tailored specifically for our platform",
        proposal: "<p>Our team is developing a specialized IDE that will significantly improve developer experience when building on this platform. Key features include:</p><ul><li>Syntax highlighting for platform-specific code</li><li>Integrated debugging tools</li><li>Built-in contract testing</li><li>One-click deployment</li></ul><p>We've already completed a proof-of-concept and need funding to develop the full product.</p>",
        requestedAmount: 15000,
        requestedPercentage: 15,
        status: "pending",
        appliedAt: "2023-10-15T14:30:00Z",
        links: [
          { title: "Prototype Demo", url: "https://example.com/demo" },
          { title: "GitHub Repo", url: "https://github.com/devteam-alpha/platform-ide" }
        ]
      },
      {
        id: "app-2",
        flowId: id,
        applicantId: "user-3",
        applicantName: "Security Solutions",
        applicantWallet: "jkl012...mno345",
        applicantAvatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
        summary: "Creating an audit toolkit and security best practices guide for smart contract developers",
        proposal: "<p>We're building comprehensive security tools to help developers write safer code. This includes:</p><ul><li>Automated vulnerability scanner</li><li>Interactive security checklist</li><li>Best practices documentation</li><li>Common vulnerability database</li></ul><p>Our team has extensive experience in security auditing and education.</p>",
        requestedAmount: 20000,
        requestedPercentage: 20,
        status: "pending",
        appliedAt: "2023-10-17T09:45:00Z",
        links: [
          { title: "Project Website", url: "https://securitysolutions.example.com" }
        ]
      }
    ],
    acceptedRecipients: [
      {
        id: "recipient-1",
        name: "Documentation Team",
        description: "Improving platform documentation and creating educational resources",
        percentage: 30,
        amount: 30000,
        received: 18000,
        receiver: {
          id: "user-9",
          name: "vuvuzela Foundation",
          avatarUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        },
      },
      {
        id: "recipient-2",
        name: "Analytics Dashboard",
        description: "Building a comprehensive analytics dashboard for platform metrics",
        percentage: 25,
        amount: 25000,
        received: 15000,
        receiver: {
          id: "user-9",
          name: "vuvuzela Foundation",
          avatarUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        },
      }
    ],
    updates: [
      {
        id: "update-1",
        author: {
          id: "user-1",
          name: "Platform Foundation",
          avatarUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        },
        content: "We're excited to announce that we've already received 20 applications in the first week! Our review team is busy evaluating them, and we'll start announcing the first batch of recipients next week.",
        createdAt: "2023-10-08T16:30:00Z",
        likes: 24,
        comments: [
          {
            id: "comment-1",
            author: {
              id: "user-8",
              name: "vuvuzela Foundation",
              avatarUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
            },
            content: "This is fantastic news! Looking forward to seeing the innovative projects that get funded.",
            createdAt: "2023-10-08T17:15:00Z"
          }
        ]
      },
      {
        id: "update-2",
        author: {
          id: "user-1",
          name: "Platform Foundation",
          avatarUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        },
        content: "Congratulations to our first two recipients: the Documentation Team and Analytics Dashboard projects! They've demonstrated exceptional vision and clear implementation plans. We're excited to see what they build.",
        createdAt: "2023-10-15T11:00:00Z",
        likes: 42,
        comments: []
      }
    ]
  };
};

export default function DistributeFlowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useUser();

  const [flow, setFlow] = useState<DistributeFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{ title: string; content: React.ReactNode }>({
    title: "",
    content: null,
  });

  // Fetch flow data
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const data = await getDistributeFlow(params.id);
        setFlow(data);
      } catch (error) {
        console.error("Error fetching distribute flow:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [params.id]);

  // Check if user is creator
  const isCreator = user && flow?.creator.id === user.id;

  // Check if user has applied
  const hasApplied = user && flow?.pendingApplications?.some((app: Application) => app.applicantId === user.id);

  // Share flow
  const handleShareFlow = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Flow link copied to clipboard!",
    });
  };

  // Apply for funding
  const handleApply = useCallback(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to apply for funding",
        variant: "destructive",
      });
      // Redirect to login page with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check if flow is active
    if (flow?.status !== FlowStatus.ACTIVE) {
      toast({
        title: "Flow not active",
        description: "This distribution flow is not currently accepting applications",
        variant: "destructive",
      });
      return;
    }

    // Redirect to application form
    router.push(`/distribute/${params.id}/apply`);
  }, [flow, user, router, params.id, toast]);

  // View existing application
  const handleViewApplication = useCallback(() => {
    if (!user || !flow) return;

    const userApplication = flow.pendingApplications?.find(app => app.applicantId === user.id);

    if (userApplication) {
      // Open dialog with application details or navigate to application detail page
      setDialogContent({
        title: "Your Application",
        content: (
          <div className="space-y-4">
            <p><strong>Status:</strong> {userApplication.status}</p>
            <p><strong>Requested Amount:</strong> {userApplication.requestedAmount} {flow.currency}</p>
            <p><strong>Submitted:</strong> {new Date(userApplication.appliedAt).toLocaleDateString()}</p>
            <div>
              <h4 className="font-medium mb-1">Your Proposal</h4>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: userApplication.proposal }} />
              </div>
            </div>
          </div>
        )
      });
      setIsDialogOpen(true);
    }
  }, [flow, user]);

  // Create update handler
  const handleCreateUpdate = async (content: string, attachments: File[]): Promise<void> => {
    // Implementation for creating an update
    console.log("Creating update:", content, attachments);
    toast({
      title: "Update posted",
      description: "Your update has been posted successfully!",
    });
  };

  // Comment on update handler
  const handleCommentOnUpdate = async (updateId: string, content: string): Promise<void> => {
    // Implementation for commenting on an update
    console.log("Commenting on update:", updateId, content);
    toast({
      title: "Comment posted",
      description: "Your comment has been posted successfully!",
    });
  };

  // Like update handler
  const handleLikeUpdate = async (updateId: string): Promise<void> => {
    // Implementation for liking an update
    console.log("Liking update:", updateId);
    toast({
      title: "Update liked",
      description: "You liked this update!",
    });
  };

  if (loading || userLoading) {
    return <DistributeDetailSkeleton />;
  }

  if (!flow) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The distribution flow you're looking for doesn't exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/app/flows">Back to Flows</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = flow.goal ? Math.min(100, Math.round((flow.raised / flow.goal) * 100)) : 0;

  // Calculate remaining days
  const remainingDays = flow.endDate
    ? Math.max(0, Math.ceil((new Date(flow.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Overview", value: "overview", icon: LayoutDashboard },
    { title: "Recipients", value: "recipients", icon: Users2, badge: flow.acceptedRecipients?.length || 0 },
    { title: "Applications", value: "applications", icon: ClipboardCheck, badge: flow.pendingApplications?.length || 0, highlight: (flow.pendingApplications?.length ?? 0) > 0 && isCreator },
    { title: "Updates", value: "updates", icon: MessageSquare, badge: flow.updates?.length || 0 },
  ];

  // Action button text based on user's status
  const actionButtonText = hasApplied ? "View Application" : "Apply for Funding";

  // Action handler
  const handlePrimaryAction = hasApplied ? handleViewApplication : handleApply;

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
            Share
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flow title and status */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{flow.title}</h1>
            <p className="text-muted-foreground">{flow.description}</p>
          </div>

          {/* Tab navigation */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="justify-start">
                {navItems.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={item.highlight ? "relative bg-amber-50 text-amber-900 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                    {/* {item.badge > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary/10 text-xs font-medium">
                        {item.badge}
                      </span>
                    )} */}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            <TabsContent value="overview" className="mt-6">
              <DistributeFlowOverview
                flow={flow}
                progress={progress}
                remainingDays={remainingDays}
              />
            </TabsContent>

            <TabsContent value="recipients" className="mt-6">
              <RecipientsView flow={flow} isCreator={isCreator} />
            </TabsContent>

            <TabsContent value="applications" className="mt-6">
              <ApplicationsView flow={flow} isCreator={isCreator} />
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <UpdatesView
                flow={flow}
                currentUser={user}
                onCreateUpdate={handleCreateUpdate}
                onComment={handleCommentOnUpdate}
                onLike={handleLikeUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DistributeFlowActions
            flow={flow}
            progress={progress}
            remainingDays={remainingDays}
            isCreator={isCreator}
            hasApplied={hasApplied ?? true}
            onPrimaryAction={handlePrimaryAction}
            actionButtonText={actionButtonText}
          />
        </div>
      </div>
    </div>
  );
}