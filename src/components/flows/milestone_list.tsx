"use client";

import { useEffect, useState, useRef } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Milestone } from "@/lib/types/funding_flow";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";


type MilestoneListProps = {
  milestones: Milestone[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<any>;
};

export function MilestoneList({ milestones, onAdd, onRemove, form }: MilestoneListProps) {
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [isOverAllocated, setIsOverAllocated] = useState(false);
  const goalAmount = Number(form.watch("goal") || 0); 

  // Use a ref to track previous state to prevent infinite loops
  const prevTotalRef = useRef(totalAllocated);
  const prevGoalRef = useRef(goalAmount);

  // Calculate total on every render but don't set state immediately
  const calculateTotal = () => {
    return milestones.reduce((sum, _, index) => {
      const amount = parseFloat(form.getValues(`milestones.${index}.amount`)) || 0;
      return sum + amount;
    }, 0);
  };

  useEffect(() => {
    const newTotal = calculateTotal();
    setTotalAllocated(newTotal);
    setIsOverAllocated(newTotal > goalAmount);
  },[])

  // Update form fields on change to validate in real-time
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Let the form handle the value change first
    // The validation will happen in the next render cycle
    const newTotal = calculateTotal();

    // Only update state if values actually changed
    if (newTotal !== prevTotalRef.current || goalAmount !== prevGoalRef.current) {
      setTotalAllocated(newTotal);
      setIsOverAllocated(newTotal > goalAmount);

      prevTotalRef.current = newTotal;
      prevGoalRef.current = goalAmount;

      // Set form error outside of render cycle
      if (newTotal > goalAmount && goalAmount > 0) {
        // Use setTimeout to break the render cycle
        setTimeout(() => {
          form.setError("milestones", {
            type: "custom",
            message: `Total milestone amount (${newTotal.toFixed(2)}) exceeds goal amount (${goalAmount.toFixed(2)})`
          });
        }, 0);
      } else {
        // Use setTimeout to break the render cycle
        setTimeout(() => {
          form.clearErrors("milestones");
        }, 0);
      }
    }
  };

  // This effect updates the totals and validation state
  // useEffect(() => {
    
  // }, [milestones, goalAmount, form]);

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
      {goalAmount > 0 && (
        <div className="space-y-2">
          {
            goalAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Milestone allocation</span>
                <span className={isOverAllocated ? "text-destructive font-medium" : ""}>
                  {(typeof totalAllocated === 'number' ? totalAllocated : 0).toFixed(2)} / {(typeof goalAmount === 'number' ? goalAmount : 0).toFixed(2)}
                </span>
              </div>
            )
          }
          <Progress
            value={(goalAmount > 0 ? (totalAllocated / goalAmount) * 100 : 0)}
            className={isOverAllocated ? "bg-destructive/20" : ""}
          />
          {isOverAllocated && (
            <p className="text-destructive text-sm">
              Warning: Total milestone amount exceeds the goal amount
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Milestone Configuration</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onAdd}
          disabled={isOverAllocated && goalAmount > 0}
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
                    render={({ field }) => {
                      // Calculate remaining budget excluding current milestone's amount
                      const currentAmount = parseFloat(field.value) || 0;
                      const otherMilestonesTotal = milestones.reduce((sum, _, i) => {
                        if (i === index) return sum; // Skip current milestone
                        const amount = parseFloat(form.getValues(`milestones.${i}.amount`)) || 0;
                        return sum + amount;
                      }, 0);

                      const remainingBudget = Math.max(0, goalAmount - otherMilestonesTotal);

                      return (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Amount to be released"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e); // Original onChange to update form values
                                handleAmountChange(e, index); // Our custom validation
                              } } />
                          </FormControl>
                          <FormDescription>
                            {currentAmount > remainingBudget ? (
                              <span className="text-destructive"> Exceeds by {(currentAmount - remainingBudget).toFixed(2)}</span>
                            ):(
                              <span className="text-muted-foreground">
                                Amount cannot exceed goal
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`milestones.${index}.deadline`}
                    render={({ field }) => {
                      // Milestone deadline only needs to be in the future per updated contract
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);

                      return (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Pick a deadline</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : "")}
                                disabled={(date) => {
                                  // Only disable dates in the past - no upper constraint needed per contract
                                  return date < tomorrow;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Milestone deadline must be in the future. 
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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