import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppConstants } from "@/lib/app_constants";
import { RefreshCw, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WalletCardProps {
    supportedCurrenciesBalances: number[];
}

export default function WalletCard({ supportedCurrenciesBalances }:WalletCardProps) {
    return (
        <div className="space-y-6">
            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Wallet</h3>

                {/* Balance Card */}
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Your Balance</CardTitle>
                    </CardHeader>
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

                {/* Wallet Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={"https://faucet.solana.com/"} target="_blank" className="flex-1">
                        <Button className="flex w-full" variant="outline">
                            <Wallet className="mr-2 h-4 w-4" />
                            Fund Wallet
                        </Button>
                    </Link>
                    <Button className="flex-1" variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Balance
                    </Button>
                </div>
            </div>
        </div>
    )
}