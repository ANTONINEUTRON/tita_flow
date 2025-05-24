import { NotificationTypes } from "@/lib/types/notification_types";
import {
    CheckCircleIcon, ClockIcon,
    ArrowDownToLineIcon,
    CoinsIcon,
    FileTextIcon,
    RocketIcon,
    TrophyIcon,
    UserPlusIcon,
    XCircleIcon
} from "lucide-react";

// Get notification icon based on type
export const getNotificationIcon = (type: NotificationTypes) => {
        switch (type) {
            case NotificationTypes.ACCOUNT_CREATED:
                return <UserPlusIcon className="h-5 w-5 text-blue-500" />;

            case NotificationTypes.NEW_CONTRIBUTION:
                return <CoinsIcon className="h-5 w-5 text-amber-500" />;

            case NotificationTypes.NEW_WITHDRAW:
                return <ArrowDownToLineIcon className="h-5 w-5 text-violet-500" />;

            case NotificationTypes.NEW_UPDATE:
                return <FileTextIcon className="h-5 w-5 text-indigo-500" />;

            case NotificationTypes.FLOW_GOAL_REACHED:
                return <TrophyIcon className="h-5 w-5 text-yellow-500" />;

            case NotificationTypes.FLOW_CANCELED:
                return <XCircleIcon className="h-5 w-5 text-red-500" />;

            case NotificationTypes.FLOW_COMPLETED:
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;

            case NotificationTypes.FLOW_CREATED:
                return <RocketIcon className="h-5 w-5 text-cyan-500" />;

            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

