"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BasicInformation } from "@/components/flows/basic-information";
import { MilestoneList } from "@/components/flows/milestone_list";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideArrowRight, LucideArrowLeft, Check, WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { GovernanceConfiguration } from "./governance-config";
import { getVotingPowerModelDescription, getVotingPowerModelDisplayName, VotingPowerModel } from "@/lib/types/funding_flow";
import toast from "react-hot-toast";
import useProfile from "@/lib/hooks/use_profile";
import useFlow from "@/lib/hooks/use_flow";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon, XIcon } from "lucide-react";



// Define form steps
enum FormStep {
  BASIC_INFO = 0,
  RULES_CONFIG = 1,
  PREVIEW = 2,
}

const createFlowValidationSchema = z.object({
  // Basic Information
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goal: z.string().min(1, "Goal amount is required").default("0"),
  currency: z.string().min(1, "Currency is required"),

  startdate: z.union([
    z.string(),
    z.date()
  ])
    .refine(val => {
      if (!val) return true; // Optional field
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(new Date(val).getTime());
    }, "Invalid date format"),

  endDate: z.union([
    z.string(),
    z.date()
  ])
    .optional()
    .refine(val => {
      if (!val) return true; // Optional field
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(new Date(val).getTime());
    }, "Invalid date format"),

  // Rules Configuration
  rules: z.object({
    milestone: z.boolean().default(false),
    governance: z.boolean().default(false),
  }),

  // Milestone Configuration
  milestones: z.array(
    z.object({
      id: z.number().min(1, "Id is required"),
      description: z.string().min(1, "Description is required"),
      amount: z.string()
        .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Amount must be greater than 0"
        })
        .transform(val => parseFloat(val)),
      deadline: z.string().min(1, "Deadline is required"),
    })
  ).optional(),

  // Governance Configuration
  votingPowerModel: z.nativeEnum(VotingPowerModel).default(VotingPowerModel.TOKEN_WEIGHTED),
  
  media: z.array(
    z.object({
      id: z.string(),
      file: z.any(),
      type: z.enum(["image", "video"]),
      previewUrl: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
    // z.any()
  ).optional(),
}).refine(data => {
  if (data.startdate && data.endDate) {
    const startDate = data.startdate instanceof Date ?
      data.startdate : new Date(data.startdate);
    const endDate = data.endDate instanceof Date ?
      data.endDate : new Date(data.endDate);

    return endDate > startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export type FlowCreationValues = z.infer<typeof createFlowValidationSchema>;

export default function CreateFlowForm() {
  const { userProfile, walletInstance, supportedCurrenciesBalances } = useProfile();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format for default start date
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const { prepareFlowData, createFlowTransaction, saveFlowToStore } = useFlow();

  const form = useForm<FlowCreationValues>({
    resolver: zodResolver(createFlowValidationSchema),
    defaultValues: {
      title: "",
      currency: "",
      description: "",
      goal: "",
      rules: {
        milestone: false,
        governance: false,
      },
      milestones: [],
      votingPowerModel: VotingPowerModel.TOKEN_WEIGHTED,
      
      media: []
    },
  });

  // Watch form values to conditionally render components
  const milestoneRule = form.watch("rules.milestone");
  const governanceRule = form.watch("rules.governance");
  const milestones = form.watch("milestones") || [];

  // Get tomorrow's date for min date on date inputs
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  // Handlers for adding/removing milestones
  const addMilestone = () => {
    const currentMilestones = form.getValues("milestones") || [];
    form.setValue("milestones", [
      ...currentMilestones,
      { id: currentMilestones.length + 1, description: "", amount: 0, deadline: "" },
    ]);
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues("milestones") || [];
    form.setValue(
      "milestones",
      currentMilestones.filter((_, i) => i !== index)
    );
  };

  // Add this function near the beginning of your component
  const validateCurrentStep = async () => {
    try {
      const rulesValidation = ["rules"];

      // Define which fields to validate at each step
      const fieldsToValidateByStep = {
        [FormStep.BASIC_INFO]: ["title", "description", "goal", "currency", "startdate", "endDate"],
        [FormStep.RULES_CONFIG]: rulesValidation,
        [FormStep.PREVIEW]: [] // No validation needed at preview step
      };
      
      // Get the fields for the current step
      const fieldsToValidate = fieldsToValidateByStep[currentStep as FormStep];
      
      // Validate only the fields for the current step
      const result = await form.trigger(fieldsToValidate as any);


      if (currentStep === FormStep.RULES_CONFIG && form.getValues("rules.milestone")) {
        return validateMilestones();
      }

      return result;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  // Add this effect to your component to link milestone and governance
  useEffect(() => {
    // Watch for changes to the milestone toggle
    const subscription = form.watch((value, { name }) => {
      // When milestone rule is toggled
      if (name === "rules.milestone") {
        const milestoneEnabled = value.rules?.milestone;
        
        // If milestone is enabled, also enable governance
        if (milestoneEnabled) {
          form.setValue("rules.governance", true);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Form submission handler
  const onSubmit = async (values: FlowCreationValues) => {
    console.log("Clicked submit with values:", values);
    setIsSubmitting(true);
    try {
      // Show loading toast
      toast("Uploading media and creating the funding flow");

      // Submit the flow data with the uploaded media URLs
      const flowId = uuidv4().substring(0, 22)

      const fflow = await prepareFlowData(flowId, values, userProfile?.wallet!, userProfile?.id!,);
      
      let {flowAddress, signature} = await createFlowTransaction(fflow, walletInstance!);

      await saveFlowToStore({...fflow, address: flowAddress, transaction_signature: signature});

      // Success notification
      toast.success("Your funding flow has been created.");

      router.push(`/flow/${flowId}`);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast(error instanceof Error ? error.message : "There was a problem creating your flow");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation functions
  const nextStep = () => {
    console.log("Current step:", currentStep);
    if (true) {
      setCurrentStep((prevStep) => (prevStep + 1) as FormStep);
    }
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => (prevStep - 1) as FormStep);
  };

  // Skip to last step (Preview)
  const skipToPreview = () => {
    form.trigger(["title", "currency", "description", "goal", "startdate", "endDate"]).then((isValid) => {
      if (isValid) {
        setCurrentStep(FormStep.PREVIEW);
      }
    });
  };

  // Modify your next step function
  const handleNextStep = async () => {
    // Validate the current step first
    const isValid = await validateCurrentStep();
    
    if (!isValid) {
      // Show a toast or some feedback
      // toast.error("Please fix the errors before proceeding");
      return;
    }

    if (currentStep < FormStep.PREVIEW) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  // Validate milestones in a simpler way based on the updated contract
const validateMilestones = () => {
  const milestones = form.getValues("milestones") || [];
  const now = Math.floor(Date.now() / 1000);
  
  // Create arrays to collect all errors
  const errors = [];
  
  // Check milestone count
  if (milestones.length === 0) {
    form.setError("milestones", {
      type: "custom",
      message: "At least one milestone is required"
    });
    errors.push("No milestones defined");
  } else if (milestones.length > 10) {
    form.setError("milestones", {
      type: "custom",
      message: "Maximum of 10 milestones allowed"
    });
    errors.push("Too many milestones (maximum is 10)");
  }
  
  // Validate each milestone
  milestones.forEach((milestone, i) => {
    // Track validation issues for this milestone
    const milestoneIssues = [];
    
    // Description validation
    if (!milestone.description?.trim()) {
      form.setError(`milestones.${i}.description`, {
        type: "required",
        message: "Description is required"
      });
      milestoneIssues.push("missing description");
    }
    
    // Amount validation
    const amount = milestone.amount;
    if (isNaN(amount) || amount <= 0) {
      form.setError(`milestones.${i}.amount`, {
        type: "custom",
        message: "Amount must be greater than 0"
      });
      milestoneIssues.push("invalid amount");
    }
    
    // Deadline validation
    try {
      const milestoneDeadline = Math.floor(new Date(milestone.deadline).getTime() / 1000);
      
      if (milestoneDeadline <= now) {
        form.setError(`milestones.${i}.deadline`, {
          type: "custom",
          message: "Deadline must be in the future"
        });
        milestoneIssues.push("deadline in the past");
      }
    } catch (e) {
      form.setError(`milestones.${i}.deadline`, {
        type: "custom",
        message: "Invalid date format"
      });
      milestoneIssues.push("invalid date format");
    }
    
    // Add consolidated error for this milestone if issues exist
    if (milestoneIssues.length > 0) {
      errors.push(`Milestone ${i+1}: ${milestoneIssues.join(", ")}`);
    }
  });
  
  // No need to check if total equals goal in the updated contract
  
  // Show all errors in one toast if any exist
  if (errors.length > 0) {
    toast.error(
      <div>
        <p>Please fix the following issues:</p>
        <ul className="list-disc pl-4 mt-1 text-sm">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    );
    return false;
  }
  
  return true;
};

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create a Fundraising Flow</CardTitle>
        <CardDescription>
          Create a flow to collect funds from donors, investors, or customers
        </CardDescription>

        {/* Step Indicator */}
        <div className="mt-12">
          <div className="flex justify-between">
            {["Basic Info", "Rules & Config", "Preview"].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === index
                  ? "bg-primary text-primary-foreground"
                  : currentStep > index
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  {currentStep > index ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1">{step}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute h-1 bg-muted inset-x-0"></div>
            <div
              className="absolute h-1 bg-primary transition-all"
              style={{
                width: `${(currentStep / (FormStep.PREVIEW)) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            {/* Step 1: Basic Information */}
            {currentStep === FormStep.BASIC_INFO && (
              <div className="space-y-6">
                <BasicInformation form={form} minDateString={minDateString} />
              </div>
            )}

            {/* Step 2: Rules & Configuration */}
            {currentStep === FormStep.RULES_CONFIG && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Rules & Configuration</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={skipToPreview}
                    className="text-muted-foreground"
                  >
                    Skip to Preview
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Milestone Rules Toggle */}
                  <FormField
                    control={form.control}
                    name="rules.milestone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Support Milestones</FormLabel>
                          <FormDescription>
                            Release funds gradually as project milestones are completed and approved
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Milestone Configuration Section */}
                  {milestoneRule && (
                    <div className="pl-4 border-l-2 border-primary/20 mt-2 mb-4">
                      <MilestoneList
                        milestones={milestones}
                        onAdd={addMilestone}
                        onRemove={removeMilestone}
                        form={form}
                      />
                    </div>
                  )}

                  {/* Governance Toggle */}
                  <FormField
                    control={form.control}
                    name="rules.governance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Governance
                          </FormLabel>
                          <FormDescription>
                            Enable voting on milestone completion by contributors
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={form.watch("rules.milestone")} // Disable toggle when milestone is enabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Governance Config section */}
                  {governanceRule && (
                    <div className="pl-4 border-l-2 border-primary/20 mt-2">
                      <GovernanceConfiguration control={form.control} />
                    </div>
                  )}

                  {form.watch("rules.milestone") && form.watch("rules.governance") && (
                    <div className="text-sm text-muted-foreground ml-4 mt-2">
                      <p>Governance is automatically enabled for milestone-based flows</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Preview & Submit */}
            {currentStep === FormStep.PREVIEW && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Review & Submit</h3>
                  <div>
                    {
                      supportedCurrenciesBalances && supportedCurrenciesBalances[0] < 0 && (
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                          <p className="text-sm text-destructive">You don't have enough balance to create a flow</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('/app/dashboard?tab=settings')}
                          >
                            <WalletIcon className="mr-2 h-4 w-4" />
                            Fund Wallet
                          </Button>
                        </div>
                      )
                    }
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Review your raise flow configuration before creating it.
                </p>

                {/* Basic Information Preview */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span>{form.getValues("title")}</span>
                    <span className="text-muted-foreground">Description:</span>
                    <span className="truncate">{form.getValues("description")}</span>
                    <span className="text-muted-foreground">Goal:</span>
                    <span>{form.getValues("goal")} {form.getValues("currency")}</span>
                    
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{new Date(form.getValues("startdate")).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{new Date(form.getValues("endDate")!).toLocaleDateString()}</span>
                  </div>
                </div>



                {/* Rules Preview */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Rules & Configuration</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-muted-foreground">Milestone-based funding:</span>
                      <span>{milestoneRule ? "Enabled" : "Disabled"}</span>
                      <span className="text-muted-foreground">Governance & Voting:</span>
                      <span>{governanceRule ? "Enabled" : "Disabled"}</span>
                    </div>

                    {/* Milestone Preview */}
                    {milestoneRule && milestones.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Milestones ({milestones.length})</h5>
                        <ul className="space-y-3 text-sm">
                          {milestones.map((milestone, index) => (
                            <div key={index} className="border-b mb-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-y-2 justify-between pb-2 last:border-0">
                              <span className="text-muted-foreground ">{milestone.description}</span>
                              <span className="">{milestone.amount} {form.getValues("currency")}</span>
                            </div>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Governance Preview */}
                    {governanceRule && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-2">Governance Settings</h5>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <span className="text-muted-foreground">Voting Model:</span>
                          <div className="flex items-center gap-1.5">
                            <span>{getVotingPowerModelDisplayName(form.getValues("votingPowerModel"))}</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full h-5 w-5 hover:bg-muted"
                                >
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="sr-only">More information</span>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="right" className="w-80 p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">About this voting model</h4>
                                    <PopoverTrigger asChild>
                                      <button className="h-5 w-5 inline-flex items-center justify-center rounded-full hover:bg-muted">
                                        <XIcon className="h-3 w-3" />
                                        <span className="sr-only">Close</span>
                                      </button>
                                    </PopoverTrigger>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {getVotingPowerModelDescription(form.getValues("votingPowerModel"))}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Media</h4>
                  {form.getValues("media") && form?.getValues("media")!.length > 0 ? (
                    <div className="space-y-4">
                      {/* Images Preview */}
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">Images</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {form?.getValues("media")!
                            .filter(item => item.type === "image")
                            .map((image, index) => (
                              <div
                                key={image.id || index}
                                className="aspect-square rounded-md border overflow-hidden relative"
                              >
                                {image.previewUrl ? (
                                  <img
                                    src={image.previewUrl}
                                    alt={image.title || `Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full bg-muted">
                                    <span className="text-muted-foreground text-sm">No preview</span>
                                  </div>
                                )}
                                {image.title && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1 text-xs truncate">
                                    {image.title}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Video Preview */}
                      {form?.getValues("media")!.some(item => item.type === "video") && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Video</h5>
                          <div className="rounded-md border overflow-hidden aspect-video">
                            {form?.getValues("media")!
                              .filter(item => item.type === "video")
                              .map((video, index) => (
                                <div key={video.id || index} className="h-full">
                                  {video.previewUrl ? (
                                    <video
                                      src={video.previewUrl}
                                      controls
                                      className="w-full h-full"
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-muted">
                                      <span className="text-muted-foreground">Video preview not available</span>
                                    </div>
                                  )}
                                </div>
                              ))[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No media files have been added to this flow.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6">
            {currentStep === FormStep.BASIC_INFO ? (
              <Button
                key={"cancelBtn"}
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            ) : (
              <Button
                key={"backBtn"}
                type="button"
                variant="outline"
                isLoading={isSubmitting}
                onClick={prevStep}
              >
                <LucideArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            {currentStep < FormStep.PREVIEW ? (
              <Button
                key={"nextBtn"}
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Next
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                key={"submitBtn"}
                isLoading={isSubmitting}
                type="submit">
                Create Flow
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
