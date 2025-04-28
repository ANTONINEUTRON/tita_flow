"use client";

import { useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type Milestone = {
  description: string;
  amount: string;
  deadline: string; // Add deadline property to the Milestone type
};

type MilestoneListProps = {
  milestones: Milestone[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<any>;
};

export function MilestoneList({ milestones, onAdd, onRemove, form }: MilestoneListProps) {
  // Generate a default deadline for new milestones
  const getDefaultDeadline = (index: number) => {
    const today = new Date();
    today.setDate(today.getDate() + 30 * (index + 1)); // Each milestone 30 days apart
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Initialize deadlines for milestones that don't have one
  useEffect(() => {
    milestones.forEach((milestone, index) => {
      if (!milestone.deadline) {
        form.setValue(
          `milestones.${index}.deadline`, 
          getDefaultDeadline(index)
        );
      }
    });
  }, [milestones.length, form]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Milestone Configuration</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>
      
      <ScrollArea className=" pr-4">
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center p-4 border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                Add milestones to define when funds will be released
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Milestone
              </Button>
            </div>
          ) : (
            milestones.map((_, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name={`milestones.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what needs to be achieved..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Amount to be released" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`milestones.${index}.deadline`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}