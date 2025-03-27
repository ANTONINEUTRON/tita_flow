"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LucideArrowRight } from "lucide-react";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Custom components
import { BasicInformation } from "@/components/flows/basic-information";
import { RULE_TYPES } from "@/lib/flow-constants";
import { useToast } from "@/lib/hooks/use-toast";

// Schema definition
const distributeFlowSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  applicationDuration: z.string().min(1, { message: "Application duration is required" }),
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
});

type DistributeFlowFormProps = {
  onCancel: () => void;
};

export default function DistributeFlowForm({ onCancel }: DistributeFlowFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<z.infer<typeof distributeFlowSchema>>({
    resolver: zodResolver(distributeFlowSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      applicationDuration: "",
      startDate: "",
      currency: "",
      rules: {
        direct: true,
        milestone: false,
        weighted: false,
      },
    },
  });

  // Get tomorrow's date in YYYY-MM-DD format for min date on date inputs
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  // Submit handler
  const onSubmit = (data: z.infer<typeof distributeFlowSchema>) => {
    console.log("Distribute flow data:", data);
    toast({
      title: "Success!",
      description: "Your distribute flow has been created.",
    });
    
    // Navigate to the flow details or dashboard page
    router.push("/app/flows");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribute Funds</CardTitle>
        <CardDescription>
          Create a flow to distribute funds to recipients based on applications or predefined rules
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information - Now using shared component */}
            <BasicInformation form={form} minDateString={minDateString} type="distribute" />

            <Separator />

            {/* Distribution Rules Configuration */}
            <RulesConfiguration form={form} />
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
      <h3 className="text-lg font-medium">Distribution Rules</h3>
      <p className="text-sm text-muted-foreground">
        Select at least one rule for how funds will be distributed
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
                Funds are transferred as a lump sum to approved applicants
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
                Funds are released when recipients achieve predefined milestones
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
                Funds are distributed by percentage to multiple recipients
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}