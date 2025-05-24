"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSignIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  AlertCircleIcon,
  CoinsIcon,
  HeartIcon,
  RocketIcon,
  Loader
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Notification } from "@/lib/types/notification";
import { getNotificationContent } from "@/lib/utils/notification_message";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import { NotificationWithTitleDesc } from "@/lib/hooks/use_notifications";
import { getNotificationIcon } from "../get_notification_icon";
import { PublicKey } from "@solana/web3.js";
import { AppConstants } from "@/lib/app_constants";
import useContribute from "@/lib/hooks/use_contribute";
import { useEffect, useState } from "react";
import { MonthlyAnalytics } from "@/lib/types/monthly_analytics";
import AppUser from "@/lib/types/user";

interface OverviewContentProps {
  flows: FundingFlowResponse[];
  showNotifications: () => void;
  notifications: NotificationWithTitleDesc[];
  contributionsOC: any;
  user: AppUser | null;
  analyticsData: MonthlyAnalytics[];
}

export function OverviewContent({
  flows,
  showNotifications,
  notifications,
  contributionsOC,
  analyticsData,
  user
}: OverviewContentProps) {
  const router = useRouter();
  const { getMonthlyAnalyticsData } = useContribute();

  if(!user) {
    return (
      <div className="text-center py-6">
        <Loader className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <h2 className="text-lg font-semibold">Loading Dashboard...</h2>
      </div>
    );
  }

  // Calculate summary metrics
  const activeFlows = flows.filter(flow => flow.status === "active");
  const completedFlows = flows.filter(flow => flow.status === "completed");
  const totalContributions = contributionsOC.reduce((total: number, contribution: any) =>
    total + ((contribution.contributed_amount / Math.pow(10, 6)) || 0), 0);
  const totalRaised = flows.reduce((total, flow) =>
    total + ((flow.raised / Math.pow(10, 6)) || 0), 0);

  // Deduce distribution data from flows array
  const getDistributionData = () => {
    // Get all unique statuses from flows
    const statusCounts = flows.reduce((counts: any, flow) => {
      // Get flow status (default to "Unknown" if missing)
      const status = flow.status || "Unknown";

      // Create title case status name (e.g., "active" -> "Active")
      const statusName = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

      // Increment the count for this status
      counts[statusName] = (counts[statusName] || 0) + 1;

      return counts;
    }, {});

    // Convert to required format
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const distributionData = getDistributionData();

  // const distributionData = [
  //   { name: "Active", value: 2 },
  //   { name: "Pending", value: 1 },
  //   { name: "Completed", value: 0 },
  // ];

  const COLORS = ["#3f0566", "#9f763b", "#C3B2D0", "#dcceb9"];


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Flows
            </CardTitle>
            <RocketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlows.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeFlows.length === 1 ? 'campaign' : 'campaigns'} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Raised
            </CardTitle>
            <CoinsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRaised} {user.preferences?.displayCurrency}</div>
            <p className="text-xs text-muted-foreground">
              Across all your flows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Flows
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedFlows.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully funded projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Contributions
            </CardTitle>
            <HeartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContributions} {user.preferences?.displayCurrency}</div>
            <p className="text-xs text-muted-foreground">
              Funds you've contributed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Funding Progress</CardTitle>
            <CardDescription>Your total fundraising across all active flows</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Funds Raised']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="value" fill="#3f0566" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hidden lg:inline">
          <CardHeader>
            <CardTitle>Flow Distribution</CardTitle>
            <CardDescription>Status of your funding flows</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [`${value} flows`, name]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '6px' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Flows */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Flows</CardTitle>
            <CardDescription>Your currently funding flows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFlows.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No active flows</p>
            ) : (
              activeFlows.slice(0, 3).map((flow) => {
                const supportCurr = AppConstants.SUPPORTEDCURRENCIES.find(
                  (currency) => currency.name === flow.currency
                );
                return (
                  <div key={flow.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{flow.title}</span>
                      <span>{Math.round((flow.raised / Number(flow.goal)) * 100)}%</span>
                    </div>
                    <Progress value={(flow.raised / Number(flow.goal)) * 100} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{(flow.raised / Math.pow(10, supportCurr?.decimals!))} {flow.currency} raised</span>
                      <span>Goal: {(Number(flow.goal) / Math.pow(10, supportCurr?.decimals!))} {flow.currency}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push('/app/dashboard?tab=flows')}>
              View All Flows
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Notifications */}
        <Card className="col-span-1 flex flex-col justify-between">
          <div >
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No notifications yet</p>
              ) : (
                notifications.slice(0, 5).map(({ notification }, index) => {
                  const { title } = getNotificationContent(notification);
                  return (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </div>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={showNotifications}>
              View All Notifications
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
