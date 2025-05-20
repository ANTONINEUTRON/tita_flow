import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ActivityIcon, ArrowUpIcon, ArrowDownIcon, 
  CheckCircleIcon, PlusCircleIcon, SettingsIcon 
} from "lucide-react";

export function ActivityContent() {
  // Mock data
  const activityData = [
    { id: 1, type: "milestone", flow: "DeFi Startup Funding", description: "Milestone 3 completed", time: "2 hours ago", amount: 25000 },
    { id: 2, type: "contribution", flow: "Community Grant Program", description: "New contribution received", time: "Yesterday", amount: 5000 },
    { id: 3, type: "milestone", flow: "Community Grant Program", description: "Milestone 2 completed", time: "3 days ago", amount: 10000 },
    { id: 4, type: "creation", flow: "NFT Project Launch", description: "New flow created", time: "1 week ago", amount: null },
    { id: 5, type: "withdrawal", flow: "Technical Bounty Fund", description: "Funds withdrawn", time: "2 weeks ago", amount: 3000 },
    { id: 6, type: "contribution", flow: "DeFi Startup Funding", description: "New contribution received", time: "2 weeks ago", amount: 15000 },
    { id: 7, type: "milestone", flow: "DeFi Startup Funding", description: "Milestone 2 completed", time: "3 weeks ago", amount: 20000 },
    { id: 8, type: "milestone", flow: "DeFi Startup Funding", description: "Milestone 1 completed", time: "1 month ago", amount: 30000 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "contribution":
        return <ArrowUpIcon className="h-5 w-5 text-primary" />;
      case "withdrawal":
        return <ArrowDownIcon className="h-5 w-5 text-orange-500" />;
      case "creation":
        return <PlusCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>History of all actions across your flows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activityData.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="rounded-full bg-muted p-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Flow: {activity.flow}</p>
                  {activity.amount && (
                    <p className="text-sm font-medium">${activity.amount.toLocaleString()}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">Load More</Button>
        </CardFooter>
      </Card>
    </div>
  );
}