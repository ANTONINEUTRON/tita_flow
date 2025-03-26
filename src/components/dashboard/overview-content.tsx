"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSignIcon, TrendingUpIcon, CheckCircleIcon, ClockIcon, ArrowUpIcon, AlertCircleIcon } from "lucide-react";

export function OverviewContent() {
  // Mock data
  const analyticsData = [
    { name: "Jan", value: 5000 },
    { name: "Feb", value: 12000 },
    { name: "Mar", value: 18000 },
    { name: "Apr", value: 25000 },
    { name: "May", value: 22000 },
    { name: "Jun", value: 30000 },
  ];
  
  const distributionData = [
    { name: "Active", value: 2 },
    { name: "Pending", value: 1 },
    { name: "Completed", value: 1 },
  ];
  
  const COLORS = ["#3f0566", "#9f763b", "#C3B2D0", "#dcceb9"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$115,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Milestones</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-xs text-muted-foreground">3 pending verification</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Next: DeFi Milestone 4 (2 days)</p>
          </CardContent>
        </Card>
      </div>

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
        
        <Card>
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
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} flows`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Flow Actions Required</CardTitle>
          <CardDescription>Items that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 border p-4 rounded-lg bg-yellow-50 border-yellow-200">
              <div className="rounded-full bg-yellow-100 p-2">
                <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Milestone verification needed</p>
                <p className="text-sm text-muted-foreground">DeFi Startup Funding - Milestone 4 submitted and awaiting your review</p>
              </div>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Review</Button>
            </div>
            
            <div className="flex items-start gap-4 border p-4 rounded-lg bg-blue-50 border-blue-200">
              <div className="rounded-full bg-blue-100 p-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Upcoming deadline</p>
                <p className="text-sm text-muted-foreground">Community Grant Program - Milestone 3 due in 5 days</p>
              </div>
              <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}