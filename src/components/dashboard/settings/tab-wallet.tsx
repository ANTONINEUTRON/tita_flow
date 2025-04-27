import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@radix-ui/react-switch";
import { SettingsTabsProp } from "./settings-content";
import { Label } from "@/components/ui/label";

export default function TabWallet({loading, handleSave}: SettingsTabsProp){
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Connected Wallets</CardTitle>
                    <CardDescription>
                        Manage your connected blockchain wallets
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                                        <rect width="128" height="128" rx="64" fill="#AB9FF2" />
                                        <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8354 41.3461 14.4738 64.0368C14.0708 89.084 35.5834 110 60.8854 110H64.8624C87.2781 110 112.069 91.7091 113.51 69.7401C113.727 67.6013 112.359 64.9142 110.584 64.9142ZM39.7689 65.9311C39.7689 69.2689 37.1593 72.0631 33.9023 72.0631C30.6452 72.0631 28.0356 69.2689 28.0356 65.9311V58.6128C28.0356 55.275 30.6452 52.5645 33.9023 52.5645C37.1593 52.5645 39.7689 55.275 39.7689 58.6128V65.9311ZM60.9991 65.9311C60.9991 69.2689 58.3895 72.0631 55.1325 72.0631C51.8754 72.0631 49.2658 69.2689 49.2658 65.9311V58.6128C49.2658 55.275 51.9188 52.5645 55.1758 52.5645C58.4329 52.5645 61.0425 55.275 61.0425 58.6128V65.9311H60.9991Z" fill="white" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Phantom</p>
                                    <p className="text-xs text-muted-foreground">Connected: Jun 12, 2023</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Disconnect</Button>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-muted-foreground truncate">0x7F9d554...5A23b</p>
                        </div>
                    </div>

                    <Button className="w-full" variant="outline">
                        Connect Another Wallet
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Settings</CardTitle>
                    <CardDescription>
                        Configure your blockchain transaction preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gas">Default Gas Setting</Label>
                        <select id="gas" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="auto">Auto (Recommended)</option>
                            <option value="fast">Fast</option>
                            <option value="normal">Normal</option>
                            <option value="slow">Slow</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="slippage" className="flex-1">
                            <div className="font-medium">Auto-approve Transactions</div>
                            <div className="text-sm text-muted-foreground">Auto-approve transactions under 0.1 ETH</div>
                        </Label>
                        <Switch id="slippage" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={loading} onClick={handleSave}>
                        {loading ? "Saving..." : "Save Settings"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}