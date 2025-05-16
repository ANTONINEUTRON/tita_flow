import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FlowStatus, MilestoneStatus } from "./types/typesbbbb";
import { Badge } from "@/components/ui/badge";

export function formatCurrency(amount: number, symbol: string = "$"): string {
  return `${symbol}${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  // Handle future dates
  if (diffInMs < 0) {
    const futureMinutes = Math.abs(Math.floor(diffInHours * 60));
    if (Math.abs(diffInHours) < 1) {
      return `in ${futureMinutes} minute${futureMinutes !== 1 ? 's' : ''}`;
    }
    const futureHours = Math.abs(Math.floor(diffInHours));
    if (Math.abs(diffInHours) < 24) {
      return `in ${futureHours} hour${futureHours !== 1 ? 's' : ''}`;
    }
    // For future dates beyond 24 hours, show formatted date
  }

  if (diffInHours < 24 && diffInHours >= 0) {
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
export function getStatusColor(status: FlowStatus | MilestoneStatus): string {
  switch (status) {
    case FlowStatus.ACTIVE:
    case MilestoneStatus.ACTIVE:
      return "bg-blue-500";
    case FlowStatus.COMPLETED:
    case MilestoneStatus.COMPLETED:
    case MilestoneStatus.VERIFIED:
    case FlowStatus.FUNDED:
      return "bg-green-500";
    case FlowStatus.DRAFT:
    case MilestoneStatus.PENDING:
      return "bg-amber-500";
    case FlowStatus.EXPIRED:
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
}

export function getStatusBadge(status: FlowStatus | MilestoneStatus): JSX.Element {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status) {
    case FlowStatus.ACTIVE:
    case MilestoneStatus.ACTIVE:
      variant = "default";
      break;
    case FlowStatus.COMPLETED:
    case MilestoneStatus.COMPLETED:
    case MilestoneStatus.VERIFIED:
    case FlowStatus.FUNDED:
      variant = "secondary";
      break;
    case FlowStatus.DRAFT:
    case MilestoneStatus.PENDING:
      variant = "outline";
      break;
    case FlowStatus.EXPIRED:
      variant = "destructive";
      break;
  }

  // Format the status text for display
  const formatStatusText = (status: string): string => {
    // Convert from UPPER_CASE or camelCase to "Title Case"
    return status
      // Insert space before uppercase letters
      .replace(/([A-Z])/g, ' $1')
      // Handle underscore case
      .replace(/_/g, ' ')
      // Trim leading space that might be added before first capital
      .trim()
      // Title case the result
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return <Badge variant={variant}> {formatStatusText(status.toString())} </Badge>;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
