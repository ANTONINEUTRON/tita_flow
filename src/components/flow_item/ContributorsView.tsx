import React, { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { ChevronRight, Download, Filter, Search, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flow } from "@/lib/types/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ContributorsViewProps {
  flow: Flow;
}

export function ContributorsView({ flow }: ContributorsViewProps) {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  
  const contributors = flow.contributors || [];
  
  // Filter contributors based on search query
  const filteredContributors = contributors.filter(contributor => 
    contributor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter contributors based on time range
  const getTimeFilteredContributors = () => {
    if (timeRange === 'all') return filteredContributors;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return filteredContributors.filter(contributor => 
      new Date(contributor.date) >= cutoffDate
    );
  };
  
  const timeFilteredContributors = getTimeFilteredContributors();
  
  // Prepare data for charts
  const prepareChartData = () => {
    // Group by day
    const contributionsByDay = timeFilteredContributors.reduce((acc: any, contributor) => {
      const date = new Date(contributor.date);
      const day = date.toISOString().split('T')[0];
      
      if (!acc[day]) {
        acc[day] = {
          day,
          formattedDay: formatDate(day),
          amount: 0,
          count: 0
        };
      }
      
      acc[day].amount += contributor.amount;
      acc[day].count += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(contributionsByDay).sort((a: any, b: any) => 
      new Date(a.day).getTime() - new Date(b.day).getTime()
    );
  };
  
  const chartData = prepareChartData();
  
  // Prepare data for pie chart (top contributors)
  const preparePieData = () => {
    // Sort by amount and take top 5, group others
    const sorted = [...timeFilteredContributors].sort((a, b) => b.amount - a.amount);
    
    let pieData = [];
    let othersSum = 0;
    let othersCount = 0;
    
    // Add top contributors
    for (let i = 0; i < sorted.length; i++) {
      if (i < 5) {
        pieData.push({
          name: sorted[i].name,
          value: sorted[i].amount
        });
      } else {
        othersSum += sorted[i].amount;
        othersCount++;
      }
    }
    
    // Add "Others" if there are more than 5 contributors
    if (othersCount > 0) {
      pieData.push({
        name: `Others (${othersCount})`,
        value: othersSum
      });
    }
    
    return pieData;
  };
  
  const pieData = preparePieData();
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#A4A4A4'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contributors</h2>
          <p className="text-muted-foreground">
            {contributors.length} contributor{contributors.length !== 1 ? 's' : ''} have donated a total of {formatCurrency(flow.raised!, flow.currencySymbol)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="day">Past 24h</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}>
            {viewMode === 'list' ? <TrendingUp className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">{viewMode === 'list' ? 'View Stats' : 'View List'}</span>
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
          <TabsTrigger value="all">All Contributors</TabsTrigger>
          <TabsTrigger value="top">Top Contributors</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {viewMode === 'list' ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>All Contributors</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search contributors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <CardDescription>
                  {timeFilteredContributors.length} contributor{timeFilteredContributors.length !== 1 ? 's' : ''} in selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {timeFilteredContributors.length > 0 ? (
                    timeFilteredContributors.map((contributor) => (
                      <div 
                        key={contributor.id} 
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contributor.avatarUrl} alt={contributor.name} />
                            <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contributor.name}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(contributor.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(contributor.amount, flow.currencySymbol)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      No contributors found for the selected filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Timeline</CardTitle>
                  <CardDescription>
                    Contributions over time in {timeRange === 'all' ? 'the entire project period' : `the past ${timeRange}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                        <XAxis 
                          dataKey="formattedDay" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${flow.currencySymbol}${value}`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${formatCurrency(value, flow.currencySymbol)}`, 'Amount']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Bar 
                          dataKey="amount" 
                          fill="var(--primary)" 
                          radius={[4, 4, 0, 0]}
                          name="Amount"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                  <CardDescription>
                    Distribution of contributions by amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${formatCurrency(value, flow.currencySymbol)}`, 'Amount']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Contributors who have donated the most to this flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[...timeFilteredContributors]
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 10)
                  .map((contributor, index) => (
                    <div 
                      key={contributor.id} 
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contributor.avatarUrl} alt={contributor.name} />
                          <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contributor.name}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(contributor.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(contributor.amount, flow.currencySymbol)}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((contributor.amount / flow.raised!) * 100)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributors</CardTitle>
              <CardDescription>
                Latest contributions to this flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[...timeFilteredContributors]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((contributor) => (
                    <div 
                      key={contributor.id} 
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contributor.avatarUrl} alt={contributor.name} />
                          <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contributor.name}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(contributor.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(contributor.amount, flow.currencySymbol)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}