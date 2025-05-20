import React, { useEffect, useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, Calendar, Clock, MessageSquare, Plus, Vote as VoteIcon 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flow, Proposal } from "@/lib/types/typesbbbb";
import { formatDate } from "@/lib/utils";
import { FundingFlow } from "@/lib/types/funding_flow";
import { fetchFlowData } from "@/lib/data/flow_item_data";
import { FundingFlowResponse } from "@/lib/types/flow.response";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProposalsViewProps {
  flow: FundingFlowResponse;
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  onCreateProposal?: (title: string, description: string, options: string[], endDate: string) => Promise<void>;
  onVote?: (proposalId: string, optionId: string) => Promise<void>;
}

// Define proposal types
enum ProposalType {
  MILESTONE_COMPLETION = "milestone_completion",
  FLOW_CANCELLATION = "flow_cancellation",
  MILESTONE_ADJUSTMENT = "milestone_adjustment",
  FLOW_FUNDING_EXTENSION = "flow_funding_extension"
}

export function ProposalsView({ 
  // flow, 
  currentUser,
  onCreateProposal,
  onVote
}: ProposalsViewProps) {
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalDescription, setNewProposalDescription] = useState('');
  const [newProposalOptions, setNewProposalOptions] = useState(['', '']);
  const [newProposalEndDate, setNewProposalEndDate] = useState('');
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [proposalType, setProposalType] = useState<ProposalType | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(0);
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [quorumPercentage, setQuorumPercentage] = useState<string>('');
  const [approvalPercentage, setApprovalPercentage] = useState<string>('');


  const flow = fetchFlowData("1");
    // const [flow, setFlow] = useState<Flow>()

    
    // useEffect(()=>{
    //   fetchFlowData("1").then(data => {
    //     setFlow(data);
    //   });
    // })
      
  
  const proposals = flow!.proposals || [];
  
  const isCreator = true;//currentUser?.id === flow!.creator.id;
  const canCreateProposal = isCreator || flow!.settings?.communityProposals;
  
  const handleCreateProposal = async () => {
    if (!onCreateProposal) return;
    
    // Filter out empty options
    const filteredOptions = newProposalOptions.filter(option => option.trim() !== '');
    
    if (
      !newProposalTitle.trim() || 
      !newProposalDescription.trim() || 
      filteredOptions.length < 2 || 
      !newProposalEndDate
    ) {
      return;
    }
    
    try {
      await onCreateProposal(
        newProposalTitle, 
        newProposalDescription, 
        filteredOptions,
        newProposalEndDate
      );
      
      // Reset form
      setNewProposalTitle('');
      setNewProposalDescription('');
      setNewProposalOptions(['', '']);
      setNewProposalEndDate('');
      setIsCreatingProposal(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };
  
  const handleAddOption = () => {
    setNewProposalOptions([...newProposalOptions, '']);
  };
  
  const handleRemoveOption = (index: number) => {
    if (newProposalOptions.length <= 2) return;
    
    const updatedOptions = [...newProposalOptions];
    updatedOptions.splice(index, 1);
    setNewProposalOptions(updatedOptions);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newProposalOptions];
    updatedOptions[index] = value;
    setNewProposalOptions(updatedOptions);
  };
  
  const openVotingDialog = (proposal: Proposal) => {
    setActiveProposal(proposal);
    setSelectedOption('');
    setShowVotingDialog(true);
  };
  
  const handleVote = async () => {
    if (!onVote || !activeProposal || !selectedOption) return;
    
    try {
      await onVote(activeProposal.id, selectedOption);
      setShowVotingDialog(false);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };
  
  // Check if the current user has already voted
  const hasVoted = (proposal: Proposal): boolean => {
    if (!currentUser) return false;
    
    return proposal.options.some(option => 
      option.voters.some(voter => voter.id === currentUser.id)
    );
  };
  
  // Get the user's selected option
  const getUserVote = (proposal: Proposal): string | null => {
    if (!currentUser) return null;
    
    for (const option of proposal.options) {
      if (option.voters.some(voter => voter.id === currentUser.id)) {
        return option.id;
      }
    }
    
    return null;
  };
  
  // Split proposals by status
  const activeProposals = proposals.filter(p => p.status === 'active');
  const closedProposals = proposals.filter(p => p.status !== 'active');
  
  if (proposals.length === 0 && !canCreateProposal) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-10">
        <VoteIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Proposals Yet</h3>
        <p className="text-muted-foreground mb-6">
          There are no proposals for this flow yet. Check back later for community voting opportunities.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proposals</h2>
          <p className="text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
            {activeProposals.length > 0 && ` • ${activeProposals.length} active`}
          </p>
        </div>
        
        {canCreateProposal && (
          <Dialog open={isCreatingProposal} onOpenChange={setIsCreatingProposal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Proposal</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Proposal Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="proposal-type">Proposal Type</Label>
                  <Select 
                    onValueChange={(value) => {
                      setProposalType(value as ProposalType);
                      // Reset type-specific fields when changing types
                      setSelectedMilestoneId(0);
                      setNewAmount("");
                      setNewDeadline("");
                      setNewEndDate("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proposal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProposalType.MILESTONE_COMPLETION}>Milestone Completion</SelectItem>
                      <SelectItem value={ProposalType.FLOW_CANCELLATION}>Flow Cancellation</SelectItem>
                      <SelectItem value={ProposalType.MILESTONE_ADJUSTMENT}>Milestone Adjustment</SelectItem>
                      <SelectItem value={ProposalType.FLOW_FUNDING_EXTENSION}>Extend Funding Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="proposal-title">Title</Label>
                  <Input
                    id="proposal-title"
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    placeholder="Proposal title"
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="proposal-description">Description</Label>
                  <Textarea
                    id="proposal-description"
                    value={newProposalDescription}
                    onChange={(e) => setNewProposalDescription(e.target.value)}
                    placeholder="Explain the purpose of this proposal"
                    rows={3}
                  />
                </div>
                
                {/* Dynamic fields based on proposal type */}
                {proposalType === ProposalType.MILESTONE_COMPLETION && (
                  <div className="space-y-2">
                    <Label htmlFor="milestone-id">Select Milestone</Label>
                    <Select onValueChange={(value) => setSelectedMilestoneId(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select milestone to mark as complete" />
                      </SelectTrigger>
                      <SelectContent>
                        {flow?.milestones?.map((milestone, index) => (
                          <SelectItem key={milestone.id} value={milestone.id.toString()}>
                            Milestone {index + 1}: {milestone.description.substring(0, 30)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {proposalType === ProposalType.MILESTONE_ADJUSTMENT && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="milestone-id">Select Milestone</Label>
                      <Select onValueChange={(value) => setSelectedMilestoneId(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select milestone to adjust" />
                        </SelectTrigger>
                        <SelectContent>
                          {flow?.milestones?.map((milestone, index) => (
                            <SelectItem key={milestone.id} value={milestone.id.toString()}>
                              Milestone {index + 1}: {milestone.description.substring(0, 30)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-amount">New Amount (Optional)</Label>
                      <Input
                        id="new-amount"
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder={`Current: ${ 0} ${flow?.currency || ''}`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-deadline">New Deadline (Optional)</Label>
                      <Input
                        id="new-deadline"
                        type="datetime-local"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </>
                )}
                
                {proposalType === ProposalType.FLOW_FUNDING_EXTENSION && (
                  <div className="space-y-2">
                    <Label htmlFor="new-end-date">New Funding End Date</Label>
                    <Input
                      id="new-end-date"
                      type="datetime-local"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
                
                {/* Common proposal configuration */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quorum-percentage">Quorum Percentage</Label>
                        <Input
                          id="quorum-percentage"
                          type="number"
                          min="1"
                          max="100"
                          value={quorumPercentage}
                          onChange={(e) => setQuorumPercentage(e.target.value)}
                          placeholder="51"
                        />
                        <p className="text-xs text-muted-foreground">Minimum participation required</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="approval-percentage">Approval Percentage</Label>
                        <Input
                          id="approval-percentage"
                          type="number"
                          min="1"
                          max="100"
                          value={approvalPercentage}
                          onChange={(e) => setApprovalPercentage(e.target.value)}
                          placeholder="51"
                        />
                        <p className="text-xs text-muted-foreground">Percentage of 'Yes' votes needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Proposal end date */}
                <div className="space-y-2">
                  <Label htmlFor="proposal-end-date">Voting End Date</Label>
                  <Input
                    id="proposal-end-date"
                    type="datetime-local"
                    value={newProposalEndDate}
                    onChange={(e) => setNewProposalEndDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingProposal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProposal} 
                  disabled={
                    !newProposalTitle.trim() || 
                    !newProposalDescription.trim() || 
                    !proposalType ||
                    !newProposalEndDate ||
                    (proposalType === ProposalType.MILESTONE_COMPLETION && !selectedMilestoneId) ||
                    (proposalType === ProposalType.MILESTONE_ADJUSTMENT && 
                      (!selectedMilestoneId || (!newAmount && !newDeadline))) ||
                    (proposalType === ProposalType.FLOW_FUNDING_EXTENSION && !newEndDate) ||
                    !quorumPercentage ||
                    !approvalPercentage
                  }
                >
                  Create Proposal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="closed">Closed Proposals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {activeProposals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-10">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Proposals</h3>
              <p className="text-muted-foreground mb-6">
                There are currently no active proposals for this flow.
              </p>
              {canCreateProposal && (
                <Button onClick={() => setIsCreatingProposal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {activeProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{proposal.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={proposal.creator.avatarUrl} alt={proposal.creator.name} />
                            <AvatarFallback>{proposal.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>
                            Created by {proposal.creator.name}
                            {proposal.creator.id === flow!.creator.id && (
                              <Badge variant="outline" className="ml-1">Creator</Badge>
                            )}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge>
                          {proposal.status === 'active' ? 'Active' : proposal.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center justify-end">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Ends {formatDate(proposal.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 whitespace-pre-line">{proposal.description}</p>
                    
                    <div className="space-y-4 mt-6">
                      {proposal.options.map((option) => (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">
                              {option.text}
                              {getUserVote(proposal) === option.id && (
                                <Badge variant="outline" className="ml-2">Your Vote</Badge>
                              )}
                            </div>
                            <div className="text-sm font-medium">
                              {option.percentage}% ({option.votes})
                            </div>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total votes: {proposal.totalVotes}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discuss
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => openVotingDialog(proposal)}
                      disabled={hasVoted(proposal)}
                    >
                      {hasVoted(proposal) ? 'Already Voted' : 'Vote'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="closed" className="mt-4">
          {closedProposals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center text-center p-10">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Closed Proposals</h3>
              <p className="text-muted-foreground">
                There are no closed proposals for this flow yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {closedProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{proposal.title}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarImage src={proposal.creator.avatarUrl} alt={proposal.creator.name} />
                            <AvatarFallback>{proposal.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>
                            Created by {proposal.creator.name}
                            {proposal.creator.id === flow!.creator.id && (
                              <Badge variant="outline" className="ml-1">Creator</Badge>
                            )}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          proposal.status === 'passed' ? 'secondary' : 
                          proposal.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center justify-end">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Ended {formatDate(proposal.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 whitespace-pre-line">{proposal.description}</p>
                    
                    <div className="space-y-4 mt-6">
                      {proposal.options.map((option) => (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">
                              {option.text}
                              {getUserVote(proposal) === option.id && (
                                <Badge variant="outline" className="ml-2">Your Vote</Badge>
                              )}
                            </div>
                            <div className="text-sm font-medium">
                              {option.percentage}% ({option.votes})
                            </div>
                          </div>
                          <Progress value={option.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      Total votes: {proposal.totalVotes}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Discussion
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Voting Dialog */}
      <Dialog open={showVotingDialog} onOpenChange={setShowVotingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vote on Proposal</DialogTitle>
            <DialogDescription>
              {activeProposal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {activeProposal?.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVotingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVote} disabled={!selectedOption}>
              Submit Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}