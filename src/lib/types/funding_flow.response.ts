import { Milestone, VotingPowerModel } from "./funding_flow";
import AppUser from "./user";

export interface FundingFlowResponse {
    id: string,
    title: string,
    description: string,
    goal: string,
    startdate: string,
    currency: string,
    enddate: string,
    creator: string,
    rules: {
        milestone: boolean,
        governance: boolean,
    },
    milestones?: Milestone[],
    completed_milestones?: number,
    status: 'active' | 'completed' | 'cancelled',
    raised: number,
    voting_power_model: VotingPowerModel,
    images: string[],
    video?: string,
    createdAt?: string,
    updatedAt?: string,
    address?: string,
    transaction_signature?: string,
    //
    users: AppUser
}