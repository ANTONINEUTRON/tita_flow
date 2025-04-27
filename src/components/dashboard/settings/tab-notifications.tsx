import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@radix-ui/react-switch";
import { SettingsTabsProp } from "./settings-content";

export default function TabNotifications({loading, handleSave}: SettingsTabsProp){
    
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Choose how you want to be notified
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="emails" className="flex-1">
                            <div className="font-medium">Email Notifications</div>
                            <div className="text-sm text-muted-foreground">Receive updates via email</div>
                        </Label>
                        <Switch id="emails" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="milestones" className="flex-1">
                            <div className="font-medium">Milestone Updates</div>
                            <div className="text-sm text-muted-foreground">Get notified when milestones change status</div>
                        </Label>
                        <Switch id="milestones" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="contributions" className="flex-1">
                            <div className="font-medium">New Contributions</div>
                            <div className="text-sm text-muted-foreground">Get notified about new funding</div>
                        </Label>
                        <Switch id="contributions" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="marketing" className="flex-1">
                            <div className="font-medium">Marketing Updates</div>
                            <div className="text-sm text-muted-foreground">Receive news about Tita features</div>
                        </Label>
                        <Switch id="marketing" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={loading} onClick={handleSave}>
                        {loading ? "Saving..." : "Save Preferences"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}