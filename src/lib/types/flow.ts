
export interface FundingFlow{
    id: string,
    title: string,
    description: string,
    goal: string,
    startdate: string,
    currency: string,
    duration: number,
    creator: string,
    creator_id: string,
    rules: {
        milestone: boolean,
        governance: boolean,
    },
    milestones?: Milestone[],
    votingPowerModel: VotingPowerModel,
    images: string[],
    video?: string,
    quorumPercentage: number,
    approvalPercentage: number,
    votingPeriodDays: number,
    
}

export enum VotingPowerModel{
    TOKEN_WEIGHTED = 'tokenWeighted',
    QUADRATIC_VOTING = 'quadraticVoting',
    INDIVIDUAL_VOTING = 'individualVoting',
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