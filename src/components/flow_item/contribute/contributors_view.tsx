import { useState, useEffect } from 'react';
import useContribute from "@/lib/hooks/use_contribute"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  User,
  ListFilter,
  ChevronDown,
  Search,
  Clock,
  RotateCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FundingFlowResponse } from '@/lib/types/flow.response';
import formatWalletAddress from '@/lib/utils/format_wallet_address';
import toast from 'react-hot-toast';
import { AppConstants } from '@/lib/app_constants';
import { SupportCurrency } from '@/lib/types/supported_currencies';

interface ContributorsViewProps {
  flow: FundingFlowResponse;
}

export function ContributorsView({ flow }: ContributorsViewProps) {
  const { getContributionsByFlow,  } = useContribute();
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const currency: SupportCurrency = AppConstants.SUPPORTEDCURRENCIES.find((c) => c.name === flow.currency)!;

  useEffect(() => {
    async function loadContributions() {
      if (!flow.id) return;
      
      setLoading(true);
      try {
        let contributionss = await getContributionsByFlow(flow);
        console.log(contributionss)
        console.log("Curenee", currency)

        if (contributionss) {
          contributionss = contributionss.map((contribution: any) => ({
            ...contribution,
            account: {
              ...contribution.account,
              totalAmount: Number(contribution.account.totalAmount), // Convert from lamports
              firstContribution: new Date(contribution.account.firstContribution * 1000),
              lastContribution: new Date(contribution.account.lastContribution * 1000),
            },
          }));
          setContributions(contributionss);
        }
      } catch (error) {
        console.error("Error loading contributions:", error);
        toast.error("Failed to load contributions");
      }
      setLoading(false);
    }
    
    loadContributions();
  }, [flow.id]);

  // Filter contributions based on search query (matching contributor address)
  const filteredContributions = contributions.filter(contribution => 
    contribution.account.contributor.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter contributions based on time range
  const getTimeFilteredContributions = () => {
    if (timeRange === 'all') return filteredContributions;
    
    const now = Date.now();
    let cutoffTimestamp: number;
    
    switch (timeRange) {
      case 'day':
        cutoffTimestamp = now - 86400000; // 24 hours in milliseconds
        break;
      case 'week':
        cutoffTimestamp = now - 604800000; // 7 days in milliseconds
        break;
      case 'month':
        cutoffTimestamp = now - 2592000000; // 30 days in milliseconds
        break;
      default:
        return filteredContributions;
    }
    
    return filteredContributions.filter(contribution => 
      contribution.account.lastContribution * 1000 > cutoffTimestamp
    );
  };
  
  const timeFilteredContributions = getTimeFilteredContributions();
  
  // Calculate statistics
  const totalContributors = new Set(timeFilteredContributions.map(c => 
    c.account.contributor.toString()
  )).size;
  
  const totalAmount = timeFilteredContributions.reduce(
    (sum, c) => sum + Number(c.account.totalAmount) / 1_000_000_000, 0
  );
  
  const averageContribution = totalContributors > 0 
    ? totalAmount / totalContributors 
    : 0;

  const refundedAmount = timeFilteredContributions
    .filter(c => c.account.refunded)
    .reduce((sum, c) => sum + Number(c.account.refundAmount) / 1_000_000_000, 0);

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Clock className="h-4 w-4 mr-1" />
                {timeRange === 'all' ? 'All Time' : 
                 timeRange === 'month' ? 'Past Month' :
                 timeRange === 'week' ? 'Past Week' : 'Past Day'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange('all')}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('month')}>Past Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('week')}>Past Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('day')}>Past Day</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="list"><User className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="stats"><BarChart className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {loading ? (
        // Loading skeleton
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs value={viewMode} className="w-full">
          {/* List View */}
          <TabsContent value="list" className="mt-0">
            {timeFilteredContributions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground mb-4">No contributions found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setTimeRange('all');
                    }}
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contributor</TableHead>
                      <TableHead className="hidden md:table-cell">First Contribution</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden sm:table-cell">Count</TableHead>
                      <TableHead className="hidden lg:table-cell">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeFilteredContributions.map((contribution, index) => {
                      const contributorAddress = contribution.account.contributor.toString();
                      const amount = Number(contribution.account.totalAmount) / Math.pow(10, currency.decimals); // Convert from lamports
                      const firstContribution = new Date(contribution.account.firstContribution );
                      const isRefunded = contribution.account.refunded;

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatWalletAddress(contributorAddress)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {formatDistanceToNow(firstContribution, { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {amount} {flow.currency}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline">
                              {contribution.account.contributionCount} {contribution.account.contributionCount === 1 ? 'time' : 'times'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {isRefunded ? (
                              <div className="flex items-center">
                                <XCircle className="text-destructive mr-1 h-4 w-4" />
                                <span className="text-xs">Refunded</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <CheckCircle className="text-green-500 mr-1 h-4 w-4" />
                                <span className="text-xs">Active</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          {/* Stats View */}
          <TabsContent value="stats" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalContributors}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeRange === 'all' ? 'All time' : `In the past ${timeRange}`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalAmount} {flow.currency}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: {averageContribution} {flow.currency} per contributor
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {timeFilteredContributions.reduce((sum, c) => sum + c.account.contributionCount, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Refund Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {refundedAmount} {flow.currency}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeFilteredContributions.filter(c => c.account.refunded).length} refunds processed
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}