
export interface FundingFlow{
    id: string,
    title: string,
    description: string,
    goal: string,
    startdate: string,
    currency: string,
    enddate: string,
    creator: string,
    creator_id: string,
    rules: {
        milestone: boolean,
        governance: boolean,
    },
    milestones?: Milestone[],
    completedMilestones?: number,
    status: 'active' | 'completed' | 'cancelled',
    raised: number,
    votingPowerModel: VotingPowerModel,
    images: string[],
    video?: string,
    // quorumPercentage: number,
    // approvalPercentage: number,
    // votingPeriodDays: number,
    createdAt?: string,
    updatedAt?: string,
    address?: string,
    transaction_signature?: string,
}

export enum VotingPowerModel{
    TOKEN_WEIGHTED = 'tokenWeighted',
    QUADRATIC_VOTING = 'quadraticVoting',
    INDIVIDUAL_VOTING = 'individualVoting',
}

export function anchorAnumBasedOnVotingPowerModel(votingPowerModel: VotingPowerModel) {
    switch (votingPowerModel) {
        case VotingPowerModel.TOKEN_WEIGHTED:
            return { tokenWeighted: {} };
        case VotingPowerModel.QUADRATIC_VOTING:
            return { quadraticVoting: {} };
        case VotingPowerModel.INDIVIDUAL_VOTING:
            return { individualVoting: {} };
    }
}

// export interface MediaItem {
//     id: string;
//     type: 'image' | 'video';
//     url: string;
//     title?: string;
//     description?: string;
// }

export interface Milestone {
    id: number,
    description: string,
    amount: number,
    deadline: string,
}