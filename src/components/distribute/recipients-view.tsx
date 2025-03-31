
// RecipientsView Component
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RecipientsViewProps {
    flow: any;
    isCreator: boolean;
}

export function RecipientsView({ flow, isCreator }: RecipientsViewProps) {
    // Dummy recipients data
    const recipients = [
        {
            id: "rec1",
            name: "Ecosystem Growth Fund",
            description: "Supporting developers building on the protocol",
            percentage: 35,
            allocated: 350,
            avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=eco",
            walletAddress: "8dRmJYaK2U5JqvcQzQW5X1BgNeNDJn9U4VJ8qHnfPj1a",
            website: "https://ecosystem.dev",
            twitter: "@ecosystemgrowth",
        },
        {
            id: "rec2",
            name: "Community Development",
            description: "Education and community engagement initiatives",
            percentage: 25,
            allocated: 250,
            avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=comm",
            walletAddress: "6qXkKYNYGjsXA3aS62Rr9X7bvRDDfFRk2Srq3AnZ9bHm",
            website: "https://community.dev",
            twitter: "@communitydev",
        },
        {
            id: "rec3",
            name: "Core Protocol Team",
            description: "Maintaining and enhancing the core protocol",
            percentage: 20,
            allocated: 200,
            avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=core",
            walletAddress: "2ZeT8kqLipV13hVvMb6JhMqKnL5YEQsKL7JsJNJppsAa",
            website: "https://protocol.dev",
            twitter: "@coreprotocol",
        },
        {
            id: "rec4",
            name: "Research Grants",
            description: "Funding innovative research and experimentation",
            percentage: 15,
            allocated: 150,
            avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=research",
            walletAddress: "4JtZ9HsfxLnGHLZJxUj2zWfC8PNWbFxSQjgSY7HoNJUc",
            website: "https://research.grants",
            twitter: "@researchgrants",
        },
        {
            id: "rec5",
            name: "Bug Bounty Program",
            description: "Incentivizing security researchers and bug reports",
            percentage: 5,
            allocated: 50,
            avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=bug",
            walletAddress: "9aWpnxm2VHVMQBzNUJAg7EsgcUPQS4KbwQ1K9Lm9JLUL",
            website: "https://bugbounty.io",
            twitter: "@bugbountyprogram",
        },
    ];

    const currency = flow.currency || "SOL";
    const currencySymbol = flow.currencySymbol || "◎";
    const totalRaised = flow.raised || 1000;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recipients</h2>
                {isCreator && (
                    <Button size="sm">
                        Manage Recipients
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Distribution Allocation</CardTitle>
                    <CardDescription>
                        Funds are distributed to recipients according to these percentages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recipients.map((recipient) => (
                            <div key={recipient.id} className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={recipient.avatarUrl} alt={recipient.name} />
                                            <AvatarFallback>{recipient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{recipient.name}</h3>
                                                <Badge variant="outline">{recipient.percentage}%</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{recipient.description}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="flex items-center"
                                                onClick={() => window.open(`https://explorer.solana.com/address/${recipient.walletAddress}`, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Wallet
                                            </DropdownMenuItem>
                                            {recipient.website && (
                                                <DropdownMenuItem
                                                    onClick={() => window.open(recipient.website, '_blank')}
                                                >
                                                    Visit Website
                                                </DropdownMenuItem>
                                            )}
                                            {recipient.twitter && (
                                                <DropdownMenuItem
                                                    onClick={() => window.open(`https://twitter.com/${recipient.twitter.replace('@', '')}`, '_blank')}
                                                >
                                                    Twitter Profile
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="pl-13 space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Allocated funds</span>
                                        <span className="font-medium">{currencySymbol} {recipient.allocated}</span>
                                    </div>
                                    <Progress
                                        value={recipient.percentage}
                                        className="h-2"
                                        style={{
                                            '--progress-foreground': recipient.percentage > 30 ? 'rgb(22 163 74)' :
                                                recipient.percentage > 15 ? 'rgb(37 99 235)' :
                                                    'rgb(245 158 11)'
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Distribution History</CardTitle>
                    <CardDescription>
                        Record of funds transferred to recipients
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                            <div>Date</div>
                            <div>Recipient</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div className="text-right">Transaction</div>
                        </div>
                        <div className="divide-y">
                            {recipients.slice(0, 3).map((recipient, i) => (
                                <div key={`dist-${i}`} className="grid grid-cols-5 gap-4 p-4 text-sm">
                                    <div>{new Date(Date.now() - (i * 86400000)).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={recipient.avatarUrl} alt={recipient.name} />
                                            <AvatarFallback>{recipient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{recipient.name}</span>
                                    </div>
                                    <div>{currencySymbol} {(recipient.allocated / 3).toFixed(2)}</div>
                                    <div>
                                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                            Confirmed
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-xs"
                                            onClick={() => window.open(`https://explorer.solana.com/tx/3Kn7ioLsQtXBxH3KRyeBsHX5Vf8fAEJjGJ95WB7hYkQ3PB3UYNbp${i}`, '_blank')}
                                        >
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
