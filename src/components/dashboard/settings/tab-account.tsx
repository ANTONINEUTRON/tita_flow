import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { SettingsTabsProp } from "./settings-content";
import { LogOut, Trash2 } from "lucide-react";
import { SignOutButton } from "@/components/buttons/sign-out-button";


export default function TabAccount({loading, handleSave}: SettingsTabsProp){

    return (
        <div className=" flex flex-col gap-3">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                            id="bio"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Tell us about yourself"
                            defaultValue="Web3 enthusiast and community builder. Working on decentralized funding solutions."
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={loading} onClick={handleSave}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                        Update your password
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <Input id="current" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <Input id="new" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input id="confirm" type="password" />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4 p-2">
                    <Button variant="outline" disabled={loading} onClick={handleSave}>
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="flex gap-4 p-2">
                <SignOutButton />
                <Button variant="destructive" className="w-full" onClick={() => alert("Account deleted")}>
                    <Trash2 className="h-4 w-4" /> Delete
                </Button>
            </Card>
        </div>
    )
}