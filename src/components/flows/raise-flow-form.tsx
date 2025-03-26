"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Coins, LucideArrowRight, Plus, Trash2 } from "lucide-react";

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

// Custom components
import { MilestoneList } from "@/components/flows/milestone-list";
import { WeightedDistributionList } from "@/components/flows/weighted-distribution-list";
import { BasicInformation } from "@/components/flows/basic-information";
import { CURRENCIES, RULE_TYPES } from "@/lib/flow-constants";
import { useToast } from "@/hooks/use-toast";

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
              <FormDescription>
                Funds are transferred directly to you as a lump sum
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
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Milestone Based
                </FormLabel>
              </div>
              <FormDescription>
                Funds are released when predefined milestones are achieved
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
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Weighted Distribution
                </FormLabel>
              </div>
              <FormDescription>
                Funds are automatically distributed to specified parties
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}