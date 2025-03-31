import React, { useState } from "react";
import { Check, CheckCircle, ChevronRight, Clock, X } from "lucide-react";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import { Application, DistributeFlow, Flow } from "@/lib/types/types";

interface ApplicationsViewProps {
    flow: DistributeFlow;
    isCreator: boolean;
}

// Sample applications data for testing
const SAMPLE_APPLICATIONS: Application[] = [
    {
        id: "app-1",
        flowId: "flow-1",
        applicantId: "user-1",
        applicantName: "Jane Smith",
        applicantWallet: "123xyz...abc",
        applicantAvatarUrl: "/avatars/jane.png",
        summary: "Building a sustainable farming initiative for community gardens",
        proposal: "<p>Our project aims to create sustainable farming practices in urban areas, focusing on community engagement and education...</p>",
        requestedAmount: 2500,
        requestedPercentage: 25,
        status: "pending",
        appliedAt: "2023-07-15T10:30:00Z",
        links: [
            { title: "Project Website", url: "https://example.com/project" },
            { title: "Twitter", url: "https://twitter.com/janesmith" }
        ]
    },
    {
        id: "app-2",
        flowId: "flow-1",
        applicantId: "user-2",
        applicantName: "Alex Johnson",
        applicantWallet: "456abc...xyz",
        applicantAvatarUrl: "/avatars/alex.png",
        summary: "Developing open-source educational resources for underserved communities",
        proposal: "<p>We're creating comprehensive open-source educational materials that can be freely distributed to schools in underserved areas...</p>",
        requestedAmount: 3500,
        requestedPercentage: 35,
        status: "approved",
        appliedAt: "2023-07-14T08:45:00Z",
        links: [
            { title: "GitHub Repository", url: "https://github.com/alexj/edu-resources" }
        ]
    },
    {
        id: "app-3",
        flowId: "flow-1",
        applicantId: "user-3",
        applicantName: "Maria Rodriguez",
        applicantWallet: "789def...ghi",
        applicantAvatarUrl: "/avatars/maria.png",
        summary: "Creating a mentorship program for women in technology",
        proposal: "<p>Our mentorship program will connect experienced women in tech with those just starting their careers...</p>",
        requestedAmount: 2000,
        requestedPercentage: 20,
        status: "rejected",
        appliedAt: "2023-07-10T14:20:00Z",
        links: [
            { title: "Program Outline", url: "https://example.com/mentorship" }
        ]
    }
];

export default function ApplicationsView({ flow, isCreator }: ApplicationsViewProps) {
    // State
    const [applications, setApplications] = useState<Application[]>(SAMPLE_APPLICATIONS);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    // Filter applications by status
    const pendingApplications = applications.filter(app => app.status === "pending");
    const approvedApplications = applications.filter(app => app.status === "approved");
    const rejectedApplications = applications.filter(app => app.status === "rejected");

    // Open application detail dialog
    const openApplicationDetail = (application: Application) => {
        setSelectedApplication(application);
        setIsDialogOpen(true);
    };

    // Close application detail dialog
    const closeApplicationDetail = () => {
        setIsDialogOpen(false);
        setSelectedApplication(null);
    };

    // Handle application approval
    const handleApproveApplication = async (application: Application) => {
        setIsProcessing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local state
            setApplications(prev =>
                prev.map(app =>
                    app.id === application.id
                        ? { ...app, status: "approved" }
                        : app
                )
            );

            toast({
                title: "Application Approved",
                description: `${application.applicantName}'s application has been approved.`,
            });

            closeApplicationDetail();
        } catch (error) {
            console.error("Error approving application:", error);
            toast({
                title: "Error",
                description: "Failed to approve application. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle application rejection
    const handleRejectApplication = async (application: Application) => {
        setIsProcessing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local state
            setApplications(prev =>
                prev.map(app =>
                    app.id === application.id
                        ? { ...app, status: "rejected" }
                        : app
                )
            );

            toast({
                title: "Application Rejected",
                description: `${application.applicantName}'s application has been rejected.`,
            });

            closeApplicationDetail();
        } catch (error) {
            console.error("Error rejecting application:", error);
            toast({
                title: "Error",
                description: "Failed to reject application. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Render application card
    const renderApplicationCard = (application: Application) => (
        <div
            key={application.id}
            className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
        >
            <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={application.applicantAvatarUrl} alt={application.applicantName} />
                    <AvatarFallback>{application.applicantName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium">{application.applicantName}</h4>
                        <Badge
                            variant={application.status === "pending"
                                ? "outline"
                                : application.status === "approved"
                                    ? "default"
                                    : "destructive"
                            }
                            className="flex items-center gap-1"
                        >
                            {application.status === "pending" && <Clock className="h-3 w-3" />}
                            {application.status === "approved" && <CheckCircle className="h-3 w-3" />}
                            {application.status === "rejected" && <X className="h-3 w-3" />}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                        Applied {formatDate(application.appliedAt)}
                    </p>

                    <p className="text-sm line-clamp-2">{application.summary}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-sm font-medium">
                            {formatCurrency(application.requestedAmount, flow.currency)}
                            {application.requestedPercentage && (
                                <span className="text-muted-foreground font-normal ml-1">
                                    ({application.requestedPercentage}%)
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-2 mt-2 md:mt-0 md:justify-center">
                {isCreator && application.status === "pending" && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleRejectApplication(application)}
                        >
                            <X className="h-4 w-4" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => handleApproveApplication(application)}
                        >
                            <Check className="h-4 w-4" />
                            Approve
                        </Button>
                    </>
                )}
                <Button
                    size="sm"
                    variant={application.status === "pending" && isCreator ? "outline" : "secondary"}
                    onClick={() => openApplicationDetail(application)}
                    className="w-full"
                >
                    View Details
                </Button>
            </div>
        </div>
    );

    // Get tab counts
    const pendingCount = pendingApplications.length;
    const approvedCount = approvedApplications.length;
    const rejectedCount = rejectedApplications.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Applications</h2>
                    <p className="text-muted-foreground">
                        {isCreator
                            ? "Review and manage funding applications from potential recipients"
                            : "View applications for this distribution flow"}
                    </p>
                </div>

                {isCreator && (
                    <Button variant="outline">
                        Download CSV
                    </Button>
                )}
            </div>

            <Tabs defaultValue="pending">
                <TabsList>
                    <TabsTrigger value="pending" className="relative">
                        Pending
                        {pendingCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary/10 text-xs font-medium">
                                {pendingCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="relative">
                        Approved
                        {approvedCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary/10 text-xs font-medium">
                                {approvedCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="relative">
                        Rejected
                        {rejectedCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary/10 text-xs font-medium">
                                {rejectedCount}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Pending Applications</span>
                                {pendingCount > 0 && isCreator && (
                                    <Button size="sm" variant="outline">
                                        Approve All
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {isCreator
                                    ? "Review and take action on pending applications"
                                    : "Applications awaiting review by the flow creator"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingCount === 0 ? (
                                <div className="text-center p-6">
                                    <p className="text-muted-foreground">No pending applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingApplications.map(application => renderApplicationCard(application))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approved" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Applications</CardTitle>
                            <CardDescription>
                                Applications that have been approved and added as recipients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {approvedCount === 0 ? (
                                <div className="text-center p-6">
                                    <p className="text-muted-foreground">No approved applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {approvedApplications.map(application => renderApplicationCard(application))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Applications</CardTitle>
                            <CardDescription>
                                Applications that were not approved for this distribution flow
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rejectedCount === 0 ? (
                                <div className="text-center p-6">
                                    <p className="text-muted-foreground">No rejected applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rejectedApplications.map(application => renderApplicationCard(application))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Application Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {selectedApplication && (
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Application Details</span>
                                <Badge
                                    variant={selectedApplication.status === "pending"
                                        ? "outline"
                                        : selectedApplication.status === "approved"
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                Submitted on {formatDate(selectedApplication.appliedAt)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Applicant Information */}
                            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={selectedApplication.applicantAvatarUrl} alt={selectedApplication.applicantName} />
                                    <AvatarFallback>{selectedApplication.applicantName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-medium">{selectedApplication.applicantName}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <span>Wallet: {selectedApplication.applicantWallet}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="text-sm font-medium mb-1">Requested Amount</h4>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(selectedApplication.requestedAmount, flow.currency)}
                                    </p>
                                    {selectedApplication.requestedPercentage && (
                                        <p className="text-sm text-muted-foreground">
                                            {selectedApplication.requestedPercentage}% of total distribution
                                        </p>
                                    )}
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h4 className="text-sm font-medium mb-1">Application Status</h4>
                                    <div className="flex items-center gap-2">
                                        {selectedApplication.status === "pending" && (
                                            <Clock className="h-5 w-5 text-amber-500" />
                                        )}
                                        {selectedApplication.status === "approved" && (
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                        )}
                                        {selectedApplication.status === "rejected" && (
                                            <X className="h-5 w-5 text-rose-500" />
                                        )}
                                        <p className="text-lg font-medium">
                                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Project Summary</h4>
                                <div className="p-4 border rounded-lg">
                                    <p>{selectedApplication.summary}</p>
                                </div>
                            </div>

                            {/* Full Proposal */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Full Proposal</h4>
                                <div className="p-4 border rounded-lg">
                                    <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedApplication.proposal }}
                                    />
                                </div>
                            </div>

                            {/* Links */}
                            {selectedApplication.links && selectedApplication.links.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Relevant Links</h4>
                                    <div className="p-4 border rounded-lg">
                                        <ul className="space-y-2">
                                            {selectedApplication.links.map((link, index) => (
                                                <li key={index} className="flex items-center">
                                                    <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {link.title || link.url}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {isCreator && selectedApplication.status === "pending" ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleRejectApplication(selectedApplication)}
                                        disabled={isProcessing}
                                        className="gap-1"
                                    >
                                        <X className="h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleApproveApplication(selectedApplication)}
                                        disabled={isProcessing}
                                        className="gap-1"
                                    >
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsDialogOpen(false)}>
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}