import { LucideIcon } from "lucide-react";

export enum FlowType {
  RAISE = "raise",
  DISTRIBUTE = "distribute"
}

export enum FlowStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  FUNDED = "funded",
  COMPLETED = "completed",
  EXPIRED = "expired"
}

export enum MilestoneStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  VERIFIED = "verified"
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  proofLink?: string;
}

export interface Contributor {
  id: string;
  name: string;
  avatarUrl?: string;
  amount: number;
  date: string;
}

export interface WeightedRecipient {
  id: string;
  username: string;
  avatarUrl?: string;
  percentage: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface Update {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: string;
}

export interface ProposalOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
  voters: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  endDate: string;
  status: 'active' | 'passed' | 'rejected' | 'expired';
  options: ProposalOption[];
  totalVotes: number;
}

export interface FlowSettings {
  communityProposals: boolean;  // Allow non-creators to create proposals
  communityUpdates: boolean;    // Allow non-creators to post updates
  communityComments: boolean;   // Allow comments on updates
  publicContributions: boolean; // Show contributor names publicly
  minimumContribution?: number; // Minimum contribution amount if set
  requireEmail: boolean;        // Require email for contributions
  termsUrl?: string;            // Custom terms and conditions URL
  allowAnonymous: boolean;      // Allow anonymous contributions
  notifications: {
    creator: {
      newContribution: boolean;
      milestoneCompleted: boolean;
      proposalCreated: boolean;
      commentAdded: boolean;
    };
    contributors: {
      statusUpdate: boolean;
      newMilestone: boolean;
      fundingComplete: boolean;
      proposalCreated: boolean;
    };
  };
}

export interface Flow {
  id: string;
  type: FlowType;
  title: string;
  description: string;
  createdAt: string;
  startDate: string;
  endDate?: string;
  status: FlowStatus;
  creator: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  currency: string;
  currencySymbol: string;
  goal?: number;
  raised?: number;
  amountToDistribute?: number;
  distributedAmount?: number;
  rules: {
    direct: boolean;
    milestone: boolean;
    weighted: boolean;
  };
  milestones?: Milestone[];
  contributors?: Contributor[];
  weightedDistribution?: WeightedRecipient[];
  updates?: Update[];
  proposals?: Proposal[];
  media?: MediaItem[];
  settings?: FlowSettings;  // Settings configuration for this flow
}

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};