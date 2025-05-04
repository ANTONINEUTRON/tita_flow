import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircleIcon } from "lucide-react";
import { useEffect } from "react";
import useFlow from "@/lib/hooks/use_flow";
import useProfile from "@/lib/hooks/use_profile";

export function FlowsContent() {
  // Mock data
  const flowsData = [
    { id: 1, name: "Community Grant Program", status: "active", raised: 25000, target: 50000, milestones: 4, completedMilestones: 2 },
    { id: 2, name: "DeFi Startup Funding", status: "active", raised: 75000, target: 100000, milestones: 5, completedMilestones: 3 },
    { id: 3, name: "NFT Project Launch", status: "pending", raised: 0, target: 30000, milestones: 3, completedMilestones: 0 },
    { id: 4, name: "Technical Bounty Fund", status: "completed", raised: 15000, target: 15000, milestones: 6, completedMilestones: 6 },
  ];

  const { getUserFlows,flows } = useFlow();
  const {userProfile} = useProfile();
 
  useEffect(() => {
    if(userProfile){
      getUserFlows(userProfile?.id ?? "").then((res) => {
        console.log("User flows", res);
      }
      ).catch((error) => {
        console.error("Error fetching user flows:", error);
      });
    }
  },[userProfile])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flowsData.map((flow) => (
          <Card key={flow.id} className={flow.status === "pending" ? "border-dashed" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{flow.name}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                  ${flow.status === "active" ? "bg-green-100 text-green-800" : ""}
                  ${flow.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                  ${flow.status === "completed" ? "bg-blue-100 text-blue-800" : ""}
                `}>
                  {flow.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-medium">${flow.raised.toLocaleString()} of ${flow.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${(flow.raised / flow.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Milestones</span>
                    <span className="font-medium">{flow.completedMilestones} of {flow.milestones} completed</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary"
                      style={{ width: `${(flow.completedMilestones / flow.milestones) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/flows/${flow.id}`}>Manage Flow</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <Card className="border-dashed flex flex-col items-center justify-center h-full min-h-[220px]">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              <PlusCircleIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Create New Flow</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set up a new funding flow with customizable rules and milestones
            </p>
            <Button asChild className="mt-2">
              <Link href="/flows/create">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}