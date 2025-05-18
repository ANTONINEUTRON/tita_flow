import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppConstants } from "@/lib/app_constants";
import { RefreshCw, Wallet, ArrowUpRight, KeyRound, InfoIcon, Key, KeyRoundIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAirdrop } from "@/lib/hooks/use_airdrop";
import useProfile from "@/lib/hooks/use_profile";
import AppUser from "@/lib/types/user";

interface WalletCardProps {
    supportedCurrenciesBalances: number[];
    user: AppUser;
    fetchBalance: (indexToFetch?: number) => Promise<void>;
}

export default function WalletCard({ supportedCurrenciesBalances, user, fetchBalance }: WalletCardProps) {
    const { requestDevnetToken, isLoading } = useAirdrop();
    const [fundDialogOpen, setFundDialogOpen] = useState(false);
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

    const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
    const [withdrawToken, setWithdrawToken] = useState<string>(AppConstants.SUPPORTEDCURRENCIES[0]?.name || "");
    const [withdrawAmount, setWithdrawAmount] = useState<string>("");
    const [withdrawAddress, setWithdrawAddress] = useState<string>("");

    // Add validation
    const getMaxAmount = () => {
        if (!withdrawToken) return 0;
        const index = AppConstants.SUPPORTEDCURRENCIES.findIndex(c => c.name === withdrawToken);
        return supportedCurrenciesBalances[index] || 0;
    };

    const isWithdrawValid = () => {
        return (
            withdrawToken &&
            withdrawAddress &&
            withdrawAddress.length >= 32 && // Basic validation for Solana address
            withdrawAmount &&
            Number(withdrawAmount) > 0 &&
            Number(withdrawAmount) <= getMaxAmount()
        );
    };


    return (
        <div className="space-y-6">
            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Wallet</h3>

                {/* Balance Card */}
                <Card className="mb-4">
                    <div className="pb-3 flex justify-between space-y-1.5 p-6">
                        <CardTitle className="text-base">Your Balance</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" onClick={() => {
                                fetchBalance().then(() => {
                                    toast.success("Balance refreshed!");
                                }, (error) => {
                                    toast.error("Failed to refresh balance: " + error);
                                });
                            }}>
                                <RefreshCw className="h-4 w-4" />
                                {/* <span>Refresh Wallet</span> */}
                            </Button>
                            <Button variant="ghost"  >
                                <KeyRoundIcon className="h-4 w-4" />
                                {/* <span>Export</span> */}
                            </Button>
                        </div>
                    </div>
                    <CardContent>
                        <div className="space-y-2">
                            {
                                AppConstants.SUPPORTEDCURRENCIES.map((currency, index) => {
                                    return (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-2">
                                                    <Image src={currency.logo} width={30} height={30} alt="sol icon" className="text-white" />
                                                </div>
                                                <span>{currency.name}</span>
                                            </div>
                                            <span className="font-medium">{supportedCurrenciesBalances[index]} {currency.name}</span>
                                        </div>
                                    )
                                })
                            }

                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Actions - Improved UI */}
                <div className="space-y-4">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            className="w-full"
                            variant="default"
                            onClick={() => setFundDialogOpen(true)}
                            isLoading={isLoading}
                        >
                            <Wallet className="mr-2 h-4 w-4" />
                            Add Funds
                        </Button>
                        <Button 
                            className="w-full" 
                            onClick={() => setWithdrawDialogOpen(true)}
                            variant="outline">
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Withdraw
                        </Button>
                    </div>

                </div>
            </div>

            <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Funds (Devnet)</DialogTitle>
                        <DialogDescription>
                            You're currently on Devnet. Select which token you'd like to add to your wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 p-3 mb-4">
                            <div className="flex">
                                <InfoIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    These are test tokens on Solana Devnet and have no real value. Use them to test the application's features.
                                </p>
                            </div>
                        </div>

                        <RadioGroup
                            value={selectedToken}
                            onValueChange={setSelectedToken}
                            className="gap-4"
                        >
                            {AppConstants.SUPPORTEDCURRENCIES.map((currency) => (
                                <div key={currency.name} className="flex items-center space-x-2">
                                    <RadioGroupItem value={currency.name} id={`token-${currency.name}`} />
                                    <Label htmlFor={`token-${currency.name}`} className="flex items-center">
                                        <div className="w-5 h-5 mr-2">
                                            <Image
                                                src={currency.logo}
                                                alt={currency.name}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <span>{currency.name}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFundDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!selectedToken) return;

                                // Find the selected currency index
                                const currencyIndex = AppConstants.SUPPORTEDCURRENCIES.findIndex(
                                    c => c.name === selectedToken
                                );

                                // Check if balance exceeds limit
                                if (supportedCurrenciesBalances[currencyIndex] > 1000) {
                                    toast.error(`You already have sufficient ${selectedToken} (${supportedCurrenciesBalances[currencyIndex]}). You can't request more at this time.`);
                                    setFundDialogOpen(false);
                                    return;
                                }

                                setFundDialogOpen(false);

                                // Use the hook function to request the token
                                const result = await requestDevnetToken(
                                    user,
                                    AppConstants.SUPPORTEDCURRENCIES[currencyIndex]
                                );

                                fetchBalance(currencyIndex); // Fetch balance for the selected token

                            }}
                            disabled={!selectedToken}
                        >
                            Add Funds
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Withdraw Funds (Devnet)</DialogTitle>
                        <DialogDescription>
                            Transfer tokens from your wallet to another address.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Devnet Notice */}
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 p-3">
                            <div className="flex">
                                <InfoIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    You are on Devnet. These tokens have no real value and are for testing only.
                                </p>
                            </div>
                        </div>

                        {/* Token Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-token">Select Token</Label>
                            <Select
                                value={withdrawToken}
                                onValueChange={setWithdrawToken}
                            >
                                <SelectTrigger id="withdraw-token">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AppConstants.SUPPORTEDCURRENCIES.map((currency, index) => (
                                        <SelectItem
                                            key={currency.name}
                                            value={currency.name}
                                            disabled={!supportedCurrenciesBalances[index] || supportedCurrenciesBalances[index] <= 0}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 mr-2">
                                                    <Image
                                                        src={currency.logo}
                                                        alt={currency.name}
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                                <span>{currency.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="withdraw-amount">Amount</Label>
                                <Button
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setWithdrawAmount(getMaxAmount().toString())}
                                >
                                    Max
                                </Button>
                            </div>
                            <Input
                                id="withdraw-amount"
                                type="number"
                                placeholder="0.0"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                min="0"
                                max={getMaxAmount()}
                                step="0.000001"
                            />
                            <p className="text-xs text-muted-foreground">
                                Available: {getMaxAmount()} {withdrawToken}
                            </p>
                        </div>

                        {/* Address Input */}
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-address">Destination Address</Label>
                            <Input
                                id="withdraw-address"
                                type="text"
                                placeholder="Enter Solana address"
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setWithdrawDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    toast.loading(`Withdrawing ${withdrawAmount} ${withdrawToken}...`);

                                    // API call would go here
                                    await new Promise(r => setTimeout(r, 1000)); // Simulated delay

                                    toast.dismiss();
                                    toast.success(`Successfully withdrew ${withdrawAmount} ${withdrawToken}`);
                                    setWithdrawDialogOpen(false);

                                    // Reset form
                                    setWithdrawAmount("");
                                    setWithdrawAddress("");
                                } catch (error) {
                                    toast.dismiss();
                                    toast.error(`Failed to withdraw: ${error}`);
                                }
                            }}
                            disabled={!isWithdrawValid()}
                        >
                            Withdraw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}