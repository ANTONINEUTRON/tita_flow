import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";
import { AppConstants } from "@/lib/app_constants";
import Image from "next/image";

interface ContributeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedToken: string;
    setSelectedToken: (token: string) => void;
    amount: string;
    setAmount: (amount: string) => void;
    userBalance: number;
    onContribute: () => void;
}

export function ContributeDialog({
    open,
    onOpenChange,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
    userBalance,
    onContribute,
}: ContributeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                {AppConstants.SUPPORTEDCURRENCIES.map(token => (
                                    <SelectItem key={token.name} value={token.name}>
                                        <div className="flex gap-1 items-center justify-between">
                                            <Image
                                                src={token.logo}
                                                alt={token.name}
                                                width={21}
                                                height={21}
                                                className="mr-2" />
                                            {token.name}
                                        </div>

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
                        <Button onClick={onContribute}>Contribute</Button>
                        {/* <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button> */}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}