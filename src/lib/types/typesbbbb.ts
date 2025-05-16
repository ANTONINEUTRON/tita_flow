import { CANCELLED } from "dns";
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
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  PAUSED = "paused"
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

export interface Contribution {
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
  receivedAmount: number;
  links?: { title: string; url: string; }[];
  wallet: "fghhjjj...hhhjj";
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
  createdAt?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  likes?: number;
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
  createdAt?: string;
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
  goal: number;
  raised: number;
  amountToDistribute?: number;
  distributedAmount?: number;
  rules: {
    direct: boolean;
    milestone: boolean;
    weighted: boolean;
  };
  distributionHistory?: {
    id: string;
    date: string;
    recipientName: string;
    amount: number;
    transactionHash: string;
  }[];
  milestones?: Milestone[];
  contributors?: Contribution[];
  weightedDistribution?: WeightedRecipient[];
  updates?: Update[];
  proposals?: Proposal[];
  media?: MediaItem[];
  settings?: FlowSettings;  // Settings configuration for this flow
  pendingApplications?: Application[];
  acceptedRecipients?: Recipient[];
}



export interface DistributeFlow {
  id: string;
  status: FlowStatus;
  title: string;
  description: string;
  raised: number;
  currency: string;
  currencySymbol: string;
  goal: number;
  media?: MediaItem[];
  treasuryAddress: string;
  acceptedRecipients?: Recipient[];
  pendingApplications?: Application[];
  creator: {
    id: string;
    name: string;
    avatar?: string;
    username: string;
    bio?: string;
  };
  updates?: Update[];
  applicationSuccessRate: number;
  createdAt: string;
  startDate: string;
  endDate?: string;
}


export interface Application {
  id: string;
  flowId: string;
  applicantId: string;
  applicantName: string;
  applicantWallet: string;
  applicantAvatarUrl: string;
  requestedAmount: number;
  requestedPercentage: number;
  summary: string;
  proposal: string;
  links: { title: string; url: string; }[];
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Recipient {
  id: string;
  name: string;
  description: string;
  percentage: number;
  amount: number;
  received: number;
  receiver: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};