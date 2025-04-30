"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BasicInformation } from "@/components/flows/basic-information";
import { MilestoneList } from "@/components/flows/milestone-list";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LucideArrowRight, LucideArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useToast } from "@/lib/hooks/use-toast";
import { GovernanceConfiguration } from "./governance-config";
import { FundingFlow, VotingPowerModel } from "@/lib/types/flow";
import { v4 as uuidv4 } from 'uuid';
import toast from "react-hot-toast";
import { useUser } from "@civic/auth/react";

// Define form steps
enum FormStep {
  BASIC_INFO = 0,
  RULES_CONFIG = 1,
  PREVIEW = 2,
}

const raiseFlowSchema = z.object({
  // Basic Information
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goal: z.string().min(1, "Goal amount is required").default("0"),
  startdate: z.string().min(1, "Deadline is required"),
  currency: z.string().min(1, "Currency is required"),
  duration: z.number().min(1, "Funding duration can't be less than a day").max(90, "Funding duration cannot exceed 90 days"),

  // Rules Configuration
  rules: z.object({
    milestone: z.boolean().default(false),
    governance: z.boolean().default(false),
  }),

  // Milestone Configuration
  milestones: z.array(
    z.object({
      id: z.number().min(6, "Id is required"),
      description: z.string().min(1, "Description is required"),
      amount: z.number().min(1, "Amount is required"),
      deadline: z.string().min(1, "Deadline is required"),
    })
  ).optional(),

  // Governance Configuration
  votingPowerModel: z.nativeEnum(VotingPowerModel).default(VotingPowerModel.TOKEN_WEIGHTED),
  quorumPercentage: z.number().min(1).max(100).default(30),
  approvalPercentage: z.number().min(51).max(100).default(50),
  votingPeriodDays: z.number().min(1).default(7),
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
});

type RaiseFlowFormValues = z.infer<typeof raiseFlowSchema>;

export default function RaiseFlowForm() {
  // const { toast } = useToast();
  const {user} = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);

  // Get today's date in YYYY-MM-DD format for default start date
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const form = useForm<RaiseFlowFormValues>({
    resolver: zodResolver(raiseFlowSchema),
    defaultValues: {
      title: "",
      currency: "",
      description: "",
      goal: "0",
      startdate: formattedToday,
      duration: 3,
      rules: {
        milestone: false,
        governance: false,
      },
      milestones: [],
      votingPowerModel: VotingPowerModel.TOKEN_WEIGHTED,
      quorumPercentage: 30,
      approvalPercentage: 51,
      votingPeriodDays: 7,
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


  // Form submission handler
  const onSubmit = async (values: RaiseFlowFormValues) => {
    console.log("Form values:", values);
    let flowToSubmitted: FundingFlow = {
      id: uuidv4(),
      title: values.title,
      description: values.description,
      goal: values.goal,
      duration: values.duration,
      startdate: values.startdate,
      currency: values.currency,

      rules: values.rules,
      creator: "0x1234567890abcdef", // Placeholder for creator's address
      creator_id: user?.id!, // Placeholder for creator's ID
      milestones: values.milestones || [],
      votingPowerModel: values.votingPowerModel,
      quorumPercentage: values.quorumPercentage,
      approvalPercentage: values.approvalPercentage,
      votingPeriodDays: values.votingPeriodDays,
      images: [],
      video: "",
    }

    console.log("Flow to be submitted11:", flowToSubmitted);

    try {
      // Validate milestone-based rules
      if (values.rules.milestone && (!values.milestones || values.milestones.length === 0)) {
        // toast({
        //   title: "Validation Error",
        //   description: "At least one milestone is required when milestone-based funding is enabled",
        //   variant: "destructive",
        // });
        toast("At least one milestone is required when milestone-based funding is enabled")
        return;
      }

      // Show loading toast
      toast("Uploading media and creating your raise flow");



      // Create a copy of the form values to avoid mutating the original
      const submissionValues = { ...values };

      // Handle media uploads if present
      if (submissionValues.media && submissionValues.media.length > 0) {
        try {
          // Prepare for media upload
          const mediaFiles = submissionValues.media.filter(item => item.file); // Only items with files need upload

          if (mediaFiles.length > 0) {
            // Create FormData for file upload
            const formData = new FormData();

            // Append each media file to FormData
            mediaFiles.forEach((mediaItem, index) => {
              formData.append(mediaItem.type, mediaItem.file);
              // formData.append(`fileInfo${index}`, JSON.stringify({
              //   id: mediaItem.id,
              //   title: mediaItem.title,
              //   type: mediaItem.type
              // }));
            });

            // Upload the media files
            const uploadResponse = await fetch('/api/upload-flow-media', {
              method: 'POST',
              body: formData,
            });
            console.log("Upload response:", uploadResponse);
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload media files');
            }

            // Get the uploaded media URLs
            const uploadedMedia = await uploadResponse.json();

            console.log("Uploaded media:", uploadedMedia);

            flowToSubmitted.images = uploadedMedia.imageUrls || [];
            flowToSubmitted.video = uploadedMedia.videoUrl || "";

            // Replace the media items with their uploaded versions
            // flowToSubmitted.media = uploadedMedia.imageUrl.map(image => {
            //   // Find the matching uploaded item
            //   const uploadedItem = uploadedMedia.find((uploaded: any) => uploaded.id === item.id);

            //   // if (uploadedItem) {
            //   // Return the item with the uploaded URL
            //   return {
            //     id: uploadedItem.id,
            //     title: uploadedItem.title,
            //     type: uploadedItem.type,
            //     url: uploadedItem.url, // The permanent URL from the server
            //   };
            //   // }

            //   // return item;
            // });
          }
        } catch (uploadError) {
          console.error("Media upload error:", uploadError);
          toast.error("There was a problem uploading your media files. Please try again.");
          
          return;
        }
      }

      console.log("Flow to be submitted:", flowToSubmitted);

      // // Cleanup client-side only data before submitting to API
      // if (submissionValues.media) {
      //   submissionValues.media = submissionValues.media.map(item => {
      //     // Create a new object without the file and previewUrl properties
      //     const { file, previewUrl, ...cleanedItem } = item;
      //     return cleanedItem;
      //   });
      // }

      // Submit the flow data with the uploaded media URLs
      const response = await fetch('/api/flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowToSubmitted),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create flow');
      }

      const flowData = await response.json();

      // Success notification
      toast.success("Your raise flow has been created.");

      router.push(`/flow/${flowData.id}`);

    } catch (error) {
      console.error("Error submitting form:", error);

      toast(error instanceof Error ? error.message : "There was a problem creating your flow");
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
    form.trigger(["title", "currency", "description", "goal", "startdate", "duration"]).then((isValid) => {
      if (isValid) {
        setCurrentStep(FormStep.PREVIEW);
      }
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create a Raise Flow</CardTitle>
        <CardDescription>
          Create a flow to collect funds from donors, investors, or customers
        </CardDescription>

        {/* Step Indicator */}
        <div className="mt-6">
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
                          <FormLabel className="text-base">Milestone-based funding</FormLabel>
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
                          <FormLabel className="text-base">Enable Governance</FormLabel>
                          <FormDescription>
                            Allow contributors to vote on proposals and decisions
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

                  {/* Governance Config section */}
                  {governanceRule && (
                    <div className="pl-4 border-l-2 border-primary/20 mt-2">
                      <GovernanceConfiguration control={form.control} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Preview & Submit */}
            {currentStep === FormStep.PREVIEW && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Review & Submit</h3>
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
                    <span>{form.getValues("goal")}</span>
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{new Date(form.getValues("startdate")).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{form.getValues("duration")}</span>
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
                            <li key={index} className="border-b pb-2 last:border-0">
                              <div className="text-muted-foreground text-xs">{milestone.description}</div>
                              <div className="text-right mt-1">{milestone.amount}</div>
                            </li>
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
                          <span>{form.getValues("votingPowerModel")}</span>
                          <span className="text-muted-foreground">Quorum:</span>
                          <span>{form.getValues("quorumPercentage")}%</span>
                          <span className="text-muted-foreground">Approval Threshold:</span>
                          <span>{form.getValues("approvalPercentage")}%</span>
                          <span className="text-muted-foreground">Voting Period:</span>
                          <span>{form.getValues("votingPeriodDays")} days</span>
                        </div>
                      </div>
                    )}
                  </div>
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
                onClick={nextStep}
              >
                Next
                <LucideArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                key={"submitBtn"}
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
