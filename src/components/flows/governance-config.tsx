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
            </CardContent>
        </Card>
    );
}

// Optionally export schema for reuse
export const governanceSchema = z.object({
    votingPowerModel: z.enum(["tokenWeighted", "quadraticVoting", "individualVoting"]).default("tokenWeighted"),
});