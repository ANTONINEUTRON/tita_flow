import { AccountCreatedMetadata, ContributionMetadata, FlowCreatedMetadata, FlowGoalReachedMetadata, FlowStatusMetadata, NotificationTypes, UpdateMetadata, WithdrawalMetadata } from "./notification_types";

// Base notification properties
interface BaseNotification {
    id?: string;
    user_id: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
}

// Type-safe notification variations
export type Notification =
    | (BaseNotification & {
        type: NotificationTypes.ACCOUNT_CREATED;
        metadata: AccountCreatedMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.NEW_CONTRIBUTION;
        metadata: ContributionMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.NEW_WITHDRAW;
        metadata: WithdrawalMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.NEW_UPDATE;
        metadata: UpdateMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.FLOW_GOAL_REACHED;
        metadata: FlowGoalReachedMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.FLOW_CANCELED;
        metadata: FlowStatusMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.FLOW_COMPLETED;
        metadata: FlowStatusMetadata;
    })
    | (BaseNotification & {
        type: NotificationTypes.FLOW_CREATED;
        metadata: FlowCreatedMetadata;
    });
    