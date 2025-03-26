"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ActivityIcon, SettingsIcon,
    LayoutDashboardIcon, FolderIcon, BarChartIcon,
    MenuIcon, ChevronLeftIcon, BellIcon, PlusCircleIcon,
    XIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppConstants } from "@/lib/app_constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Import dashboard components
import { OverviewContent } from "@/components/dashboard/overview-content";
import { FlowsContent } from "@/components/dashboard/flows-content";
import { ActivityContent } from "@/components/dashboard/activity-content";
import { SettingsContent } from "@/components/dashboard/settings-content";

export default function DashboardPage() {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [activeView, setActiveView] = useState("overview");
    const [showNotifications, setShowNotifications] = useState(false);

    // Navigation items (used for both sidebar and bottom nav)
    const navItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
        { id: "flows", label: "Flows", icon: FolderIcon },
        { id: "activity", label: "Activity", icon: ActivityIcon },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];

    // Dummy notification data
    const notifications = [
        {
            id: 1,
            type: "milestone",
            title: "Milestone Completed",
            description: "DeFi Startup Funding - Milestone 3 has been verified",
            time: "2 hours ago",
            read: false
        },
        {
            id: 2,
            type: "contribution",
            title: "New Contribution",
            description: "You received $5,000 for Community Grant Program",
            time: "Yesterday",
            read: false
        },
        {
            id: 3,
            type: "alert",
            title: "Milestone Deadline Approaching",
            description: "Community Grant Program - Milestone 3 due in 5 days",
            time: "Yesterday",
            read: true
        },
        {
            id: 4,
            type: "milestone",
            title: "Milestone Review Required",
            description: "Technical Bounty Fund - New milestone submission pending your review",
            time: "3 days ago",
            read: true
        },
        {
            id: 5,
            type: "system",
            title: "System Update",
            description: "Tita platform has been updated to version 2.1.0",
            time: "1 week ago",
            read: true
        }
    ];

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "milestone":
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case "contribution":
                return <ActivityIcon className="h-5 w-5 text-primary" />;
            case "alert":
                return <AlertCircleIcon className="h-5 w-5 text-yellow-500" />;
            case "system":
                return <SettingsIcon className="h-5 w-5 text-blue-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // Render content based on active view
    const renderContent = () => {
        switch (activeView) {
            case "overview":
                return <OverviewContent />;
            case "flows":
                return <FlowsContent />;
            case "activity":
                return <ActivityContent />;
            case "settings":
                return <SettingsContent />;
            default:
                return <OverviewContent />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar - hidden on mobile */}
            <aside
                className={cn(
                    "bg-muted hidden md:flex flex-col border-r transition-all duration-300 ease-in-out",
                    sidebarExpanded ? "w-64" : "w-[70px]"
                )}
            >
                {/* Sidebar header */}
                <div className={cn(
                    "h-16 flex items-center px-4 border-b",
                    sidebarExpanded ? "justify-between" : "justify-center"
                )}>
                    {sidebarExpanded && (
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-bold text-xl">{AppConstants.APP_NAME}</span>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        className="h-8 w-8"
                    >
                        {sidebarExpanded ? <ChevronLeftIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Rest of the sidebar implementation... */}
                {/* User profile */}
                <div className={cn(
                    "p-4 flex items-center border-b",
                    !sidebarExpanded && "justify-center"
                )}>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/user.png" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    {sidebarExpanded && (
                        <div className="ml-3 overflow-hidden">
                            <p className="font-medium truncate">Jane Doe</p>
                            <p className="text-xs text-muted-foreground truncate">jane@example.com</p>
                        </div>
                    )}
                </div>

                {/* Create new flow button */}
                <div className="p-4">
                    <Button
                        className={cn(
                            "w-full justify-center",
                            !sidebarExpanded && "px-0"
                        )}
                    >
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        {sidebarExpanded && "Create Flow"}
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1">
                    <div className="px-3 py-2">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <TooltipProvider key={item.id} disableHoverableContent={sidebarExpanded}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setActiveView(item.id)}
                                                className={cn(
                                                    "w-full flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                                                    activeView === item.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                    !sidebarExpanded && "justify-center px-2"
                                                )}
                                            >
                                                <item.icon className={cn("h-4 w-4", sidebarExpanded && "mr-2")} />
                                                {sidebarExpanded && <span>{item.label}</span>}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {item.label}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </nav>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Content header */}
                <header className="h-16 border-b flex items-center justify-between px-6">
                    <h1 className="text-xl font-semibold">
                        {navItems.find(item => item.id === activeView)?.label}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNotifications(true)}
                            className="relative"
                        >
                            <BellIcon className="h-5 w-5" />
                            {/* Notification indicator - only show if there are unread notifications */}
                            {notifications.some(n => !n.read) && (
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
                    {renderContent()}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-10">
                <div className="grid grid-cols-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={cn(
                                "flex flex-col items-center justify-center py-3",
                                activeView === item.id ? "text-primary" : "text-muted-foreground"
                            )}
                            onClick={() => setActiveView(item.id)}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAB for creating flow - mobile only */}
            <div className="md:hidden fixed bottom-20 right-6 z-20">
                <Button
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center p-0"
                >
                    <PlusCircleIcon className="h-6 w-6" />
                    <span className="sr-only">Create New Flow</span>
                </Button>
            </div>

            {/* Notification Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 flex flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out",
                    "w-4/5 sm:w-1/2", // 80% on mobile, 50% on tablet/desktop
                    showNotifications ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 rounded-lg border transition-colors",
                                        notification.read ? "bg-background" : "bg-primary/5 border-primary/20"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-0.5 rounded-full p-1.5",
                                            notification.read ? "bg-muted" : "bg-primary/10"
                                        )}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "font-medium text-sm",
                                                    !notification.read && "text-primary"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {notification.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="border-t p-4">
                    <Button variant="outline" className="w-full">
                        Mark All as Read
                    </Button>
                </div>
            </div>

            {/* Overlay when notification sidebar is open */}
            {showNotifications && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setShowNotifications(false)}
                />
            )}
        </div>
    );
}