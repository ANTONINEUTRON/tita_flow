"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

type WeightedDistributionListProps = {
  distributions: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  form: any;
};

export function WeightedDistributionList({ 
  distributions, 
  onAdd, 
  onRemove, 
  form 
}: WeightedDistributionListProps) {
  // Calculate total percentage
  const getTotalPercentage = () => {
    return distributions.reduce(
      (sum, item, index) => sum + Number(form.getValues(`weightedDistribution.${index}.percentage`) || 0), 
      0
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Weighted Distribution</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recipient
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {distributions.length === 0 ? (
            <div className="text-center p-4 border rounded-lg border-dashed">
              <p className="text-muted-foreground">
                Add recipients to automatically distribute funds
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onAdd}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Recipient
              </Button>
            </div>
          ) : (
            distributions.map((_, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recipient {index + 1}</h4>
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
                  name={`weightedDistribution.${index}.username`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="@username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`weightedDistribution.${index}.percentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Percentage of funds" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Total percentage across all recipients must equal 100%
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {distributions.length > 0 && (
        <div className="flex justify-end">
          <div className={`px-4 py-2 rounded-md text-sm ${
            getTotalPercentage() === 100 
              ? "bg-green-100 text-green-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            Total: {getTotalPercentage()}%
            {getTotalPercentage() !== 100 && " (Must equal 100%)"}
          </div>
        </div>
      )}
    </div>
  );
}