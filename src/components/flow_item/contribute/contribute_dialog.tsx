import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect } from "react";
import { AppConstants } from "@/lib/app_constants";
import { SupportCurrency } from "@/lib/types/supported_currencies";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface ContributeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userBalance: number;
    selectedToken: string;
    onContribute: (amount: number, token: SupportCurrency) => void;
}

export function ContributeDialog({
    open,
    onOpenChange,
    userBalance,
    selectedToken,
    onContribute,
}: ContributeDialogProps) {
    // const [selectedToken, setSelectedToken] = useState<string>(AppConstants.SUPPORTEDCURRENCIES[0].name);
    const [amount, setAmount] = useState<string>('0.1');
    const [isAmountValid, setIsAmountValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!amount || parseFloat(amount) <= 0) {
            setIsAmountValid(false);
            setErrorMessage("Please enter a valid amount");
        } else if (parseFloat(amount) > userBalance) {
            setIsAmountValid(false);
            setErrorMessage(`Amount exceeds your ${selectedToken} balance`);
        } else {
            setIsAmountValid(true);
            setErrorMessage(null);
        }
    }, [amount, userBalance, selectedToken]);

    const handleContribute = () => {
        const selectedCurrency = AppConstants.SUPPORTEDCURRENCIES.find(c => c.name === selectedToken);
        if (selectedCurrency && amount) {
            onContribute(parseFloat(amount), selectedCurrency);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contribute to Flow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* 
                        <div>
                        <label className="block mb-1 text-sm font-medium">Select Token</label>
                        <Select value={selectedToken} onValueChange={setSelectedToken}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {AppConstants.SUPPORTEDCURRENCIES.map((token: SupportCurrency) => (
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
                    */}
                    <div>
                        <label className="block mb-2 text-sm font-medium">Amount</label>
                        <Input
                            type="number"
                            min="0"
                            className={`mb-2 ${!isAmountValid ? "border-destructive" : ""}`}
                            placeholder="Enter amount"
                            onChange={e => setAmount(e.target.value)}
                        />
                        
                        {errorMessage && (
                            <div className="flex p-2 m-2 border text-red-500 border-red-500 rounded-lg items-center">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs pl-4">
                                    {errorMessage}
                                </AlertDescription>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground mt-1">
                                <b>Balance:</b> {userBalance} {selectedToken}
                            </div>
                            <Link href="/app/dashboard?tab=settings">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    title="Add funds to your wallet"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span className="sr-only">Add funds</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex justify-between w-full">
                    <div>
                        <Button onClick={handleContribute} disabled={!isAmountValid || !amount}>Contribute</Button>
                        {/* <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button> */}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}