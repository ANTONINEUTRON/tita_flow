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

export function getVotingPowerModelDisplayName(votingPowerModel: VotingPowerModel): string {
    switch (votingPowerModel) {
        case VotingPowerModel.TOKEN_WEIGHTED:
            return "Token Weighted Voting";
        case VotingPowerModel.QUADRATIC_VOTING:
            return "Quadratic Voting";
        case VotingPowerModel.INDIVIDUAL_VOTING:
            return "One Person, One Vote";
        default:
            return "Unknown Voting Model";
    }
}

export function getVotingPowerModelDescription(votingPowerModel: VotingPowerModel): string {
    switch (votingPowerModel) {
        case VotingPowerModel.TOKEN_WEIGHTED:
            return "Voting power is proportional to the amount of tokens held";
        case VotingPowerModel.QUADRATIC_VOTING:
            return "Voting power scales as the square root of tokens, reducing the influence of large token holders";
        case VotingPowerModel.INDIVIDUAL_VOTING:
            return "Each contributor has equal voting power regardless of contribution amount";
        default:
            return "";
    }
}

// Usage example:
// const displayName = getVotingPowerModelDisplayName(flow.votingPowerModel);
// const description = getVotingPowerModelDescription(flow.votingPowerModel);

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