import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { AppConstants } from "@/lib/app_constants";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";

interface FlowProgressProps {
  flow: FundingFlowResponse;
  activeFlowOnchainData: any;
}

export function FlowProgress({ flow, activeFlowOnchainData }: FlowProgressProps) {
  // Get the token decimals from your currency configuration
  const currency = AppConstants.SUPPORTEDCURRENCIES.find(c => c.name === flow?.currency);
  const decimals = currency?.decimals || 6; // Default to 6 if not found

  // Convert blockchain values to human-readable amounts
  const goal = activeFlowOnchainData?.goal ? Number(activeFlowOnchainData.goal) / Math.pow(10, decimals) : Number(flow?.goal || 0);
  const raised = activeFlowOnchainData?.raised ? Number(activeFlowOnchainData.raised) / Math.pow(10, decimals) : 0;
  const available = activeFlowOnchainData?.available ? Number(activeFlowOnchainData.available) / Math.pow(10, decimals) : 0;
  const withdrawn = activeFlowOnchainData?.withdrawn ? Number(activeFlowOnchainData.withdrawn) / Math.pow(10, decimals) : 0; //raised - available;

  // Calculate percentages based on adjusted goal
  const availablePercentage = goal > 0 ? (available / goal) * 100 : 0;
  const withdrawnPercentage = goal > 0 ? (withdrawn / goal) * 100 : 0;
  const totalPercentage = goal > 0 ? (raised / goal) * 100 : 0;
  const [showWithdrawn, setShowWithdrawn] = useState(false);

  // Format values for display
  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: amount < 0.01 ? 6 : amount < 1 ? 4 : 2
    });
  };
  
  const formattedRaised = formatAmount(raised);
  const formattedGoal = formatAmount(goal);
  const formattedWithdrawn = formatAmount(withdrawn);
  const formattedAvailable = formatAmount(available);
  const currencySymbol = currency?.name || '';

  return (
    <CardContent className="pb-3">
      <div className="mb-4">
        {/* Amount raised with goal */}
        <div className="flex justify-between mb-2">
          <div className="font-light">
            <span className="font-semibold text-base">{formattedRaised}</span>
          </div>
          <div className="text-muted-foreground">
            of <span className="font-light">{formattedGoal}</span> {currencySymbol}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden relative mb-2">
          {/* Available funds segment */}
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out absolute left-0"
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            aria-label={`Available: ${totalPercentage.toFixed(1)}%`}
          />
          
          {/* Withdrawn funds segment - make it clickable */}
          {withdrawn > 0 && (
            <div 
              className="h-full bg-green-500 transition-all duration-500 ease-in-out absolute cursor-pointer hover:bg-green-600"
              style={{ 
                width: `${Math.min(withdrawnPercentage, 100)}%`,
                left: `${Math.min(availablePercentage, 100)}%`
              }}
              aria-label={`Withdrawn: ${withdrawnPercentage.toFixed(1)}%`}
              onClick={() => setShowWithdrawn(!showWithdrawn)}
              title="Click to view withdrawal details"
            />
          )}
        </div>

        {/* Withdrawal details toggle button */}
        {withdrawn > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowWithdrawn(!showWithdrawn)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showWithdrawn ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showWithdrawn ? "Hide" : "Show"} withdrawals
            </button>
            <span className="text-xs text-muted-foreground">
              {totalPercentage.toFixed(1)}% of goal
            </span>
          </div>
        )}

        {/* Withdrawal breakdown - shown when toggled */}
        {showWithdrawn && withdrawn > 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium text-primary">
                {formattedAvailable} {currencySymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Withdrawn:</span>
              <span className="font-medium text-green-600">
                {formattedWithdrawn} {currencySymbol}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total Raised:</span>
              <span>{formattedRaised} {currencySymbol}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Rest of the component... */}
    </CardContent>
  );
}