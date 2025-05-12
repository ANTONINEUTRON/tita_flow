import React, { useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Add your Select component import

import { NavItem } from "../../../lib/types/types";
import { FlowHeader } from "./FlowHeader";
import { FlowProgress } from "./FlowProgress";
import { SidebarNavigation } from "./SidebarNavigation";
import { FundingFlowResponse } from "@/lib/types/flow.response";

interface Token {
  symbol: string;
  name: string;
}

const TOKENS: Token[] = [
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "ETH", name: "Ethereum" },
];

// Mock user balances for demonstration
const USER_BALANCES: Record<string, number> = {
  USDC: 120.5,
  SOL: 3.14,
  ETH: 0.25,
};

interface FlowSidebarProps {
  flow: FundingFlowResponse;
  activeView: string;
  navItems: NavItem[];
  progress: number;
  remainingDays: number | null;
  onNavigate: (view: string) => void;
  onContribute: (amount?: number, token?: string) => void; // Accept token
}

export function FlowSidebar({
  flow,
  activeView,
  navItems,
  progress,
  remainingDays,
  onNavigate,
  onContribute
}: FlowSidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>(TOKENS[0].symbol);

  const handleContributeClick = () => setDialogOpen(true);

  const handleDialogContribute = () => {
    const parsed = parseFloat(amount);
    if (!isNaN(parsed) && parsed > 0) {
      onContribute(parsed, selectedToken);
      setDialogOpen(false);
      setAmount("");
    }
    // Optionally handle invalid input
  };

  const userBalance = USER_BALANCES[selectedToken] ?? 0;

  return (
    <div className="hidden md:block md:w-64 flex-shrink-0">
      <Card className="sticky top-4">
        <FlowHeader flow={flow} />

        {/* Progress for Raise Flow */}
        <FlowProgress
          flow={flow}
          progress={progress}
          remainingDays={remainingDays}
        />

        <CardContent className="pt-0">
          <Separator className="my-3" />
          <SidebarNavigation 
            navItems={navItems}
            activeView={activeView}
            onNavigate={onNavigate}
          />
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={handleContributeClick}>
            <Coins className="mr-2 h-4 w-4" />
            Contribute to Flow
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Select Token</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.name} ({token.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Amount</label>
              <Input
                type="number"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Balance: {userBalance} {selectedToken}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between w-full">
            <div>
              <Button onClick={handleDialogContribute}>Contribute</Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}