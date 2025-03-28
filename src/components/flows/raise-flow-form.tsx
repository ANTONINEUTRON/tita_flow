"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Coins, LucideArrowRight, Plus, Trash2, AlertTriangle } from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Custom components
import { MilestoneList } from "@/components/flows/milestone-list";
import { WeightedDistributionList } from "@/components/flows/weighted-distribution-list";
import { BasicInformation } from "@/components/flows/basic-information";
import { CURRENCIES, RULE_TYPES } from "@/lib/flow-constants";
import { useToast } from "@/lib/hooks/use-toast";

// Schema definition
const raiseFlowSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  goal: z.string().optional(),
  duration: z.string().optional(),
  startDate: z.string({ required_error: "Start date is required" }),
  currency: z.string({ required_error: "Please select a currency" }),
  rules: z.object({
    direct: z.boolean().optional(),
    milestone: z.boolean().optional(),
    weighted: z.boolean().optional(),
  }).refine(data => data.direct || data.milestone || data.weighted, {
    message: "Select at least one rule",
    path: ["rules"]
  }),
  milestones: z.array(
    z.object({
      title: z.string().min(3, { message: "Title is required" }),
      description: z.string().optional(),
      amount: z.string().min(1, { message: "Amount is required" }),
    })
  ).optional(),
  weightedDistribution: z.array(
    z.object({
      username: z.string().min(3, { message: "Username is required" }),
      percentage: z.string().min(1, { message: "Percentage is required" }),
    })
  ).optional(),
  votingMechanisms: z.object({
    normal: z.boolean().optional(),
    futarchy: z.boolean().optional(),
    quadratic: z.boolean().optional(),
  }).optional(),
});

type RaiseFlowFormProps = {
  onCancel: () => void;
};

export default function RaiseFlowForm({ onCancel }: RaiseFlowFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<z.infer<typeof raiseFlowSchema>>({
    resolver: zodResolver(raiseFlowSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      duration: "",
      startDate: "",
      currency: "",
      rules: {
        direct: true,
        milestone: false,
        weighted: false,
      },
      milestones: [],
      weightedDistribution: [],
      votingMechanisms: {
        normal: true,
        futarchy: false,
        quadratic: false,
      },
    },
  });

  // Watch form values to conditionally render components
  const milestoneRule = form.watch("rules.milestone");
  const weightedRule = form.watch("rules.weighted");
  const milestones = form.watch("milestones") || [];
  const weightedDistribution = form.watch("weightedDistribution") || [];

  // Get tomorrow's date in YYYY-MM-DD format for min date on date inputs
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  // Handlers for adding/removing milestones
  const addMilestone = () => {
    const currentMilestones = form.getValues("milestones") || [];
    form.setValue("milestones", [
      ...currentMilestones,
      { title: "", description: "", amount: "" }
    ]);
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues("milestones") || [];
    form.setValue("milestones", 
      currentMilestones.filter((_, i) => i !== index)
    );
  };

  // Handlers for adding/removing weighted distribution
  const addWeightedDistribution = () => {
    const currentDistribution = form.getValues("weightedDistribution") || [];
    form.setValue("weightedDistribution", [
      ...currentDistribution,
      { username: "", percentage: "" }
    ]);
  };

  const removeWeightedDistribution = (index: number) => {
    const currentDistribution = form.getValues("weightedDistribution") || [];
    form.setValue("weightedDistribution", 
      currentDistribution.filter((_, i) => i !== index)
    );
  };

  // Submit handler
  const onSubmit = (data: z.infer<typeof raiseFlowSchema>) => {
    // Validate total milestone amounts don't exceed goal if specified
    if (data.rules.milestone && data.goal && data.milestones) {
      const totalMilestoneAmount = data.milestones.reduce(
        (sum, milestone) => sum + Number(milestone.amount), 0
      );
      
      if (totalMilestoneAmount > Number(data.goal)) {
        return toast({
          title: "Validation Error",
          description: "Total milestone amounts cannot exceed the funding goal",
          variant: "destructive",
        });
      }
    }

    // Validate total weighted distribution is 100%
    if (data.rules.weighted && data.weightedDistribution) {
      const totalPercentage = data.weightedDistribution.reduce(
        (sum, item) => sum + Number(item.percentage), 0
      );
      
      if (totalPercentage !== 100) {
        return toast({
          title: "Validation Error",
          description: "Total percentage distribution must equal 100%",
          variant: "destructive",
        });
      }
    }

    console.log("Raise flow data:", data);
    toast({
      title: "Success!",
      description: "Your raise flow has been created.",
    });
    
    // Navigate to the flow details or dashboard page
    router.push("/app/flows");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise Funds</CardTitle>
        <CardDescription>
          Create a flow to collect funds from donors, investors, or customers
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information - Now using shared component */}
            <BasicInformation form={form} minDateString={minDateString} type="raise" />

            <Separator />

            {/* Rules Configuration */}
            <RulesConfiguration form={form} />

            {/* Milestone Configuration - Only show if milestone rule is selected */}
            {milestoneRule && (
              <MilestoneList 
                milestones={milestones} 
                onAdd={addMilestone} 
                onRemove={removeMilestone} 
                form={form} 
              />
            )}

            {/* Weighted Distribution Configuration - Only show if weighted rule is selected */}
            {weightedRule && (
              <WeightedDistributionList 
                distributions={weightedDistribution}
                onAdd={addWeightedDistribution}
                onRemove={removeWeightedDistribution}
                form={form}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Flow
              <LucideArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Rules Configuration Component
function RulesConfiguration({ form }: { form: any }) {
  // Watch the milestone and weighted fields to conditionally show voting options
  const showMilestoneVoting = form.watch("rules.milestone");
  const showWeightedVoting = form.watch("rules.weighted");
  
  // Determine if we need to show any voting options
  const showVotingOptions = showMilestoneVoting || showWeightedVoting;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Rules Configuration</h3>
      <p className="text-sm text-muted-foreground">
        Select at least one rule for how funds will be processed
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="rules.direct"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Direct Transfer
                </FormLabel>
              </div>
              <FormDescription className="pl-6">
                Funds are transferred directly to your account as they are received.
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rules.milestone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // If unchecked, also clear any voting options
                      if (!checked && !form.getValues("rules.weighted")) {
                        form.setValue("votingMechanisms", {
                          normal: true,
                          futarchy: false,
                          quadratic: false
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Milestone Based
                </FormLabel>
              </div>
              <FormDescription className="pl-6">
                Funds are released when predefined milestones are completed and verified.
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rules.weighted"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // If unchecked, also clear any voting options
                      if (!checked && !form.getValues("rules.milestone")) {
                        form.setValue("votingMechanisms", {
                          normal: true,
                          futarchy: false,
                          quadratic: false
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Weighted Distribution
                </FormLabel>
              </div>
              <FormDescription className="pl-6">
                Funds are automatically distributed to multiple recipients based on percentages.
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
      
      {/* Voting Mechanism Section - Only shown if milestone or weighted is selected */}
      {showVotingOptions && (
        <div className="mt-8 p-4 border rounded-lg bg-muted/40">
          <h4 className="text-base font-medium mb-2">Voting Mechanisms</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Select at least one voting mechanism for proposals related to {showMilestoneVoting ? 'milestones' : ''} 
            {showMilestoneVoting && showWeightedVoting ? ' and ' : ''}
            {showWeightedVoting ? 'weighted distribution' : ''}.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="votingMechanisms.normal"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        // At least one voting mechanism must be selected
                        disabled={field.value && 
                          !form.getValues("votingMechanisms.futarchy") && 
                          !form.getValues("votingMechanisms.quadratic")}
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer">
                      Normal Voting
                    </FormLabel>
                  </div>
                  <FormDescription className="pl-6">
                    Standard one-person-one-vote mechanism. Simple majority wins.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="votingMechanisms.futarchy"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer flex items-center">
                      Futarchy
                      <Badge variant="outline" className="ml-2">Advanced</Badge>
                    </FormLabel>
                  </div>
                  <FormDescription className="pl-6">
                    Decision-making using prediction markets to determine which options would lead to the best outcomes.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="votingMechanisms.quadratic"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer">
                      Quadratic Voting
                    </FormLabel>
                  </div>
                  <FormDescription className="pl-6">
                    Voters can express strength of preference, with cost increasing quadratically with more votes.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Note:</strong> Selecting multiple voting mechanisms will allow proposal creators to choose which mechanism to use for each proposal. Normal voting is recommended for most cases.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}