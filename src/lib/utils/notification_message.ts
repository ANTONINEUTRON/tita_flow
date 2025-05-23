import { Notification } from "../types/notification";
import { 
  NotificationTypes,
  AccountCreatedMetadata,
  ContributionMetadata,
  WithdrawalMetadata,
  UpdateMetadata,
  FlowGoalReachedMetadata,
  FlowStatusMetadata,
  FlowCreatedMetadata } from "../types/notification_types";

interface NotificationContent {
  title: string;
  message: string;
}

/**
 * Get the title and message for a notification based on its type and strongly-typed metadata
 * 
 * @param notification The strongly-typed notification object
 * @returns An object containing the title and formatted message
 */
export function getNotificationContent(notification: Notification): NotificationContent {
  switch (notification.type) {
    case NotificationTypes.ACCOUNT_CREATED:
      return getAccountCreatedContent(notification.metadata);
    
    case NotificationTypes.NEW_CONTRIBUTION:
      return getContributionContent(notification.metadata);
    
    case NotificationTypes.NEW_WITHDRAW:
      return getWithdrawalContent(notification.metadata);
    
    case NotificationTypes.NEW_UPDATE:
      return getUpdateContent(notification.metadata);
    
    case NotificationTypes.FLOW_GOAL_REACHED:
      return getGoalReachedContent(notification.metadata);
    
    case NotificationTypes.FLOW_CANCELED:
      return getFlowCanceledContent(notification.metadata);
    
    case NotificationTypes.FLOW_COMPLETED:
      return getFlowCompletedContent(notification.metadata);
    
    case NotificationTypes.FLOW_CREATED:
      return getFlowCreatedContent(notification.metadata);
      default: 
      return {
        title: "Unknown Notification",
        message: "This notification type is not recognized.",
      };
  }
}

// Type-safe helper functions for each notification type

function getAccountCreatedContent(metadata: AccountCreatedMetadata): NotificationContent {
  return {
    title: "Welcome to Titaflow",
    message: `Welcome ${metadata.username || 'User'}! Your account has been successfully created. You can now create your flow or start contributing to a funding flow.`,
  };
}

function getContributionContent(metadata: ContributionMetadata): NotificationContent {
    const contributorText = 'You received a contribution of ';

  return {
    title: "New Contribution",
    message: `${contributorText} ${metadata.amount} ${metadata.currency} to your flow "${metadata.flowTitle}".`,
  };
}

function getWithdrawalContent(metadata: WithdrawalMetadata): NotificationContent {
  return {
    title: "Withdrawal Completed",
    message: `Your withdrawal of ${metadata.amount} ${metadata.currency} from "${metadata.flowTitle}" has been processed successfully.`,
  };
}

function getUpdateContent(metadata: UpdateMetadata): NotificationContent {
  return {
    title: "New Flow Update",
    message: `${metadata.creatorName} has posted a new update on "${metadata.flowTitle}".`,
  };
}

function getGoalReachedContent(metadata: FlowGoalReachedMetadata): NotificationContent {
  let message = `Congratulations! Your flow "${metadata.flowTitle}" has reached its funding goal of ${metadata.goalAmount} ${metadata.currency}.`;
  
  if (metadata.contributorCount) {
    message += ` ${metadata.contributorCount} contributor${metadata.contributorCount !== 1 ? 's' : ''} helped make this possible.`;
  }
  
  return {
    title: "Funding Goal Reached! 🎉",
    message,
  };
}

function getFlowCanceledContent(metadata: FlowStatusMetadata): NotificationContent {
  let message = `The flow "${metadata.flowTitle}" has been canceled.`;
  
  if (metadata.reason) {
    message += ` Reason: ${metadata.reason}`;
  }
  
  return {
    title: "Flow Canceled",
    message,
  };
}

function getFlowCompletedContent(metadata: FlowStatusMetadata): NotificationContent {
  return {
    title: "Flow Completed Successfully",
    message: `The flow "${metadata.flowTitle}" has been marked as completed.`,
  };
}

function getFlowCreatedContent(metadata: FlowCreatedMetadata): NotificationContent {
  let message = `Your flow "${metadata.flowTitle}" has been created and is now live!`;
  
  if (metadata.goalAmount && metadata.currency) {
    message += ` Funding goal: ${metadata.goalAmount} ${metadata.currency}.`;
  }
  
  return {
    title: "Flow Created Successfully",
    message,
  };
}

/**
 * Helper function to safely access nested metadata values with fallbacks
 * 
 * @param notification The notification object
 * @param path The path to the metadata value
 * @param fallback Fallback value if not found
 * @returns The metadata value or fallback
//  */
// export function getMetadata(notification: Notification, path: string, fallback: any = ''): any {
//   const keys = path.split('.');
//   let value = notification.metadata;
  
//   for (const key of keys) {
//     if (value === undefined || value === null) return fallback;
//     value = value[key];
//   }
  
//   return value !== undefined && value !== null ? value : fallback;
// }
