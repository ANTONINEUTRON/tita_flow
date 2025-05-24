"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    SettingsIcon,
    LayoutDashboardIcon, FolderIcon,
    MenuIcon, ChevronLeftIcon, BellIcon, PlusCircleIcon,
    XIcon, CheckCircleIcon
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppConstants } from "@/lib/app_constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import dashboard components
import { OverviewContent } from "@/components/dashboard/overview_content";
import { FlowsContent } from "@/components/dashboard/flows_content";
import { SettingsContent } from "@/components/dashboard/settings/settings-content";
import useProfile from "@/lib/hooks/use_profile";
import formatWalletAddress from "@/lib/utils/format_wallet_address";
import useFlow from "@/lib/hooks/use_flow";
import { useSearchParams } from "next/navigation";
import { useNotifications } from "@/lib/hooks/use_notifications";
import { getNotificationIcon } from "@/components/get_notification_icon";
import useContribute from "@/lib/hooks/use_contribute";
import { MonthlyAnalytics } from "@/lib/types/monthly_analytics";

export default function DashboardPage() {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [activeView, setActiveView] = useState("overview");
    const [showNotifications, setShowNotifications] = useState(false);
    const { userProfile } = useProfile()
    const { getUserFlows, flows, loading } = useFlow();
    const searchParams = useSearchParams();
    const { fetchNotifications, markAllAsRead, clearNotifications, notifications } = useNotifications();
    const { getContributionsByUser, getMonthlyAnalyticsData, contributions } = useContribute();
    const [analyticsData, setAnalyticsData] = useState<MonthlyAnalytics[]>([]);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['overview', 'flows', 'activity', 'settings'].includes(tabParam)) {
            setActiveView(tabParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (userProfile) {
            getUserFlows(userProfile?.id ?? "")

            fetchNotifications(userProfile?.id ?? "");

            getContributionsByUser(userProfile?.wallet ?? "")

            getMonthlyAnalyticsData(userProfile?.id!).then((data: MonthlyAnalytics[]) => {
                setAnalyticsData(data);
            }).catch((error) => {
                console.error("Error fetching monthly analytics data:", error);
                setAnalyticsData([]);
            });
        }
    }, [userProfile])

    const navItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
        { id: "flows", label: "Flows", icon: FolderIcon },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];

    // Render content based on active view
    const renderContent = () => {
        switch (activeView) {
            // case "overview":
            // return <OverviewContent 
            //     flows={flows}
            //     showNotifications={() => setShowNotifications(true)}
            //     notifications={notifications}
            //     contributionsOC={contributions}
            //     analyticsData={analyticsData}
            //     user={userProfile} />;
            case "flows":
                return <FlowsContent
                    flows={flows}
                    loading={loading} />;
            case "settings":
                return <SettingsContent />;
            default:
                return <OverviewContent
                    flows={flows}
                    showNotifications={() => setShowNotifications(true)}
                    notifications={notifications}
                    contributionsOC={contributions}
                    analyticsData={analyticsData}
                    user={userProfile} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <aside
                className={cn(
                    "bg-muted hidden md:flex flex-col border-r transition-all duration-300 ease-in-out",
                    sidebarExpanded ? "w-64" : "w-[70px]"
                )}>
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

                {/* User profile */}
                <div className={cn(
                    "p-4 flex items-center border-b",
                    !sidebarExpanded && "justify-center"
                )}>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile?.profile_pics} alt="User" />
                        <AvatarFallback>{userProfile?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {sidebarExpanded && (
                        <div className="ml-3 overflow-hidden">
                            <p className="font-medium truncate">
                                {userProfile?.username || "Name not set"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {formatWalletAddress(userProfile?.wallet || "")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Create new flow button */}
                <div className="p-4">
                    <Link href="/app/create">
                        <Button
                            className={cn(
                                "w-full justify-center",
                                !sidebarExpanded && "px-0"
                            )}
                        >
                            <PlusCircleIcon className="h-4 w-4 mr-2" />
                            {sidebarExpanded && "Create Flow"}
                        </Button>
                    </Link>
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
                                                )}>
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
                            {notifications.some(n => !n.notification.is_read) && (
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                            )}
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
                <div className="grid grid-cols-3">
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
                <Link href="/app/create">
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center p-0"
                    >
                        <PlusCircleIcon className="h-6 w-6" />
                        <span className="sr-only">Create New Flow</span>
                    </Button>
                </Link>
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
                                    key={notification.notification.id}
                                    className={cn(
                                        "p-4 rounded-lg border transition-colors",
                                        notification.notification.is_read ? "bg-background" : "bg-primary/5 border-primary/20"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-0.5 rounded-full p-1.5",
                                            notification.notification.is_read ? "bg-muted" : "bg-primary/10"
                                        )}>
                                            {getNotificationIcon(notification.notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "font-medium text-sm",
                                                    !notification.notification.is_read && "text-primary"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(notification.notification.created_at)}
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

                <div className="border-t p-4 flex gap-2 justify-between">
                    <Button disabled={notifications.length < 1}  variant="outline" onClick={() => {
                        markAllAsRead(userProfile?.id!)
                        setShowNotifications(false);
                    }} className="w-full">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Mark All as Read
                    </Button>
                    <Button disabled={notifications.length < 1} variant="outline" onClick={() => {
                        clearNotifications(userProfile?.id!)
                        setShowNotifications(false);
                    }} className="w-full bg-red-100">
                        <XIcon className="h-4 w-4 mr-2" />
                        Clear All
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