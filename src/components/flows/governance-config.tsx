import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Control } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { z } from "zod";

// Define the expected shape of data this component works with
interface GovernanceSchema {
  votingPowerModel: "tokenWeighted" | "quadraticVoting" | "individualVoting";
  quorumPercentage: number;
  approvalPercentage: number;
}

type GovernanceConfigurationProps = {
  control: Control<any>; // Replace with your specific form type
  className?: string;
}

export function GovernanceConfiguration({ control, className }: GovernanceConfigurationProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Governance Settings</CardTitle>
                <CardDescription>
                    Configure how proposals are created and voted on
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Voting Power Model Selection */}
                <FormField
                    control={control}
                    name="votingPowerModel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Governance Model</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a voting power model" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="tokenWeighted">Token-Weighted (1 token = 1 vote)</SelectItem>
                                    <SelectItem value="quadraticVoting">Quadratic Voting (reduces whale influence)</SelectItem>
                                    <SelectItem value="individualVoting">Individual Voting (1 contributor = 1 vote)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                This determines how voting power is calculated when contributors vote on proposals
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Governance Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="quorumPercentage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quorum Percentage</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="50"
                                        value={field.value?.toString() || ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        min={1}
                                        max={100}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Minimum participation required for a valid vote (%)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="approvalPercentage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Approval Threshold</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="60"
                                        value={field.value?.toString() || ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        min={51}
                                        max={100}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Percentage of votes needed for approval (%)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Voting Period */}
                <FormField
                    control={control}
                    name="votingPeriodDays"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Voting Period (days)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="7"
                                    value={field.value?.toString() || ''}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    min={1}
                                    max={30}
                                />
                            </FormControl>
                            <FormDescription>
                                How long proposals stay open for voting
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}

// Optionally export schema for reuse
export const governanceSchema = z.object({
    votingPowerModel: z.enum(["tokenWeighted", "quadraticVoting", "individualVoting"]).default("tokenWeighted"),
    quorumPercentage: z.number().min(1).max(100).default(30),
    approvalPercentage: z.number().min(51).max(100).default(50),
    votingPeriodDays: z.number().min(1).max(30).default(7),
});