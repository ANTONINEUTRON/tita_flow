
export type AccountCreatedMetadata = {
    username: string;
};

export type ContributionMetadata = {
    amount: string;
    currency: string;
    flowTitle: string;
    flowId: string;
};

export type WithdrawalMetadata = {
    amount: string;
    currency: string;
    flowTitle: string;
    flowId: string;
    transactionHash?: string;
};

export type UpdateMetadata = {
    flowTitle: string;
    flowId: string;
    updateId: string;
    creatorName: string;
    updateText?: string;
};

export type FlowGoalReachedMetadata = {
    flowTitle: string;
    flowId: string;
    goalAmount: string;
    currency: string;
    totalRaised?: string;
    contributorCount?: number;
};

export type FlowStatusMetadata = {
    flowTitle: string;
    flowId: string;
    reason?: string;
};

export type FlowCreatedMetadata = {
    flowTitle: string;
    flowId: string;
    goalAmount?: string;
    currency?: string;
};

export enum NotificationTypes {
    ACCOUNT_CREATED = "account_created",
    NEW_CONTRIBUTION = "new_contribution",
    NEW_WITHDRAW = "new_withdrawal",
    NEW_UPDATE = "new_update",
    FLOW_GOAL_REACHED = "flow_goal_reached",
    FLOW_CANCELED = "flow_canceled",
    FLOW_COMPLETED = "flow_completed",
    FLOW_CREATED = "flow_created"
}
