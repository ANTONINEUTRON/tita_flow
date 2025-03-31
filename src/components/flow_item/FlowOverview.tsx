import { useState, useRef } from "react";
import { 
  Calendar, Users, DollarSign, CheckCircle2, ChevronLeft, ChevronRight, FileText, 
  ExternalLink, Coins, PieChart, Percent
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatCurrency, formatDate, formatPercentage } from "@/lib/utils";
import { Flow, WeightedRecipient } from "@/lib/types/types";

interface FlowOverviewProps {
  flow: Flow;
  onViewMilestones: () => void;
  onViewRecipients: () => void;
}

export function FlowOverview({ flow, onViewMilestones, onViewRecipients }: FlowOverviewProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          {flow.milestones && <TabsTrigger value="milestones" className="flex-1">Milestones</TabsTrigger>}
          {flow.rules?.weighted && flow.weightedDistribution && (
            <TabsTrigger value="recipients" className="flex-1">Recipients</TabsTrigger>
          )}
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex">
                <h1 className="text-3xl font-bold tracking-tight">{flow.title}</h1>
                <div className="mx-2">
                  <Badge className="mt-1">{flow.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{flow.description}</p>
            </CardContent>
          </Card>

          {/* Media Gallery Slider */}
          {flow.media && flow.media.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  {/* <CardTitle>Media</CardTitle> */}
                  <CardDescription>Photos and videos</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setActiveMediaIndex((prev) => 
                        prev === 0 ? flow.media!.length - 1 : prev - 1
                      );
                    }}
                    disabled={flow.media.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {activeMediaIndex + 1} / {flow.media.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setActiveMediaIndex((prev) => 
                        prev === flow.media!.length - 1 ? 0 : prev + 1
                      );
                    }}
                    disabled={flow.media.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Main Slider */}
                <div className="relative overflow-hidden rounded-lg aspect-video">
                  <div 
                    ref={sliderRef}
                    className="flex transition-transform duration-300 ease-in-out h-full"
                    style={{ transform: `translateX(-${activeMediaIndex * 100}%)` }}
                  >
                    {flow.media.map((item, index) => (
                      <div key={item.id} className="w-full h-full flex-shrink-0">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.title || "Flow media"} 
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === 'video' ? (
                          <div className="w-full h-full bg-black">
                            <iframe 
                              src={item.url} 
                              title={item.title || "Flow video"}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  
                  {/* Slide overlay controls for larger targets on mobile */}
                  <button 
                    className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start px-2 text-white bg-gradient-to-r from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setActiveMediaIndex((prev) => 
                        prev === 0 ? flow.media!.length - 1 : prev - 1
                      );
                    }}
                    disabled={flow.media.length <= 1}
                  >
                    <ChevronLeft className="h-8 w-8 drop-shadow-md" />
                  </button>
                  
                  <button 
                    className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end px-2 text-white bg-gradient-to-l from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setActiveMediaIndex((prev) => 
                        prev === flow.media!.length - 1 ? 0 : prev + 1
                      );
                    }}
                    disabled={flow.media.length <= 1}
                  >
                    <ChevronRight className="h-8 w-8 drop-shadow-md" />
                  </button>
                </div>
                
                {/* Caption for current media */}
                {(flow.media[activeMediaIndex].title || flow.media[activeMediaIndex].description) && (
                  <div className="mt-3 space-y-1 px-1">
                    {flow.media[activeMediaIndex].title && (
                      <h4 className="text-sm font-medium">{flow.media[activeMediaIndex].title}</h4>
                    )}
                    {flow.media[activeMediaIndex].description && (
                      <p className="text-sm text-muted-foreground">{flow.media[activeMediaIndex].description}</p>
                    )}
                  </div>
                )}
                
                {/* Thumbnails */}
                {flow.media.length > 1 && (
                  <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 px-1">
                    {flow.media.map((item, index) => (
                      <button 
                        key={item.id} 
                        className={cn(
                          "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border",
                          activeMediaIndex === index ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                        )}
                        onClick={() => setActiveMediaIndex(index)}
                      >
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.title || `Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.url.split('/').pop()}/mqdefault.jpg`}
                              alt={item.title || `Video ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Flow Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Flow Type</dt>
                  <dd>{flow.type === "raise" ? "Fundraising" : "Distribution"}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="flex items-center gap-2">
                    {getStatusBadge(flow.status)}
                  </dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                  <dd>{formatDate(flow.startDate)}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                  <dd>{flow.endDate ? formatDate(flow.endDate) : "No end date"}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
                  <dd>{flow.currency}</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-sm font-medium text-muted-foreground">Rules</dt>
                  <dd>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {flow.rules.direct && (
                        <Badge variant="outline">Direct Transfer</Badge>
                      )}
                      {flow.rules.milestone && (
                        <Badge variant="outline">Milestone Based</Badge>
                      )}
                      {flow.rules.weighted && (
                        <Badge variant="outline">Weighted Distribution</Badge>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {flow.type === "raise" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Funding Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flow.rules.direct && (
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Direct Transfer</h4>
                        <p className="text-sm text-muted-foreground">
                          Funds are transferred directly to the creator as they are received.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {flow.rules.milestone && (
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Milestone Based</h4>
                        <p className="text-sm text-muted-foreground">
                          Funds are released when predefined milestones are completed and verified.
                        </p>
                        {flow.milestones && (
                          <Button 
                            variant="link" 
                            className="px-0" 
                            onClick={() => setActiveTab("milestones")}
                          >
                            View {flow.milestones.length} milestones
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {flow.rules.weighted && (
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Weighted Distribution</h4>
                        <p className="text-sm text-muted-foreground">
                          Funds are automatically distributed to multiple recipients based on predefined percentages.
                        </p>
                        {flow.weightedDistribution && (
                          <Button 
                            variant="link" 
                            className="px-0" 
                            onClick={() => setActiveTab("recipients")}
                          >
                            View recipients
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Milestones Tab */}
        {flow.milestones && (
          <TabsContent value="milestones" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>
                  Track progress through predefined project milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {flow.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative">
                      {index < flow.milestones!.length - 1 && (
                        <div className="absolute top-6 left-3 w-px h-full bg-border -z-10"></div>
                      )}
                      <div className="flex gap-4">
                        <div className={`relative rounded-full h-6 w-6 flex items-center justify-center ${getStatusColor(milestone.status)} text-white`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            </div>
                            {getStatusBadge(milestone.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex gap-2 items-center">
                              <Coins className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(milestone.amount, flow.currencySymbol)}</span>
                            </div>
                            {milestone.dueDate && (
                              <div className="flex gap-2 items-center">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Due {formatDate(milestone.dueDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          {milestone.proofLink && (
                            <Button variant="link" className="p-0 h-auto text-sm" asChild>
                              <a href={milestone.proofLink} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                View submission
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {/* Recipients Tab */}
        {flow.rules?.weighted && flow.weightedDistribution && (
          <TabsContent value="recipients" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
                <CardDescription>
                  Funds are distributed to these recipients based on their allocation percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Distribution Chart */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Distribution Breakdown
                  </h3>
                  <div className="h-8 w-full flex rounded-full overflow-hidden">
                    {flow.weightedDistribution.map((recipient, index) => (
                      <div
                        key={recipient.id}
                        className="h-full transition-all duration-300 hover:opacity-80"
                        style={{
                          width: `${recipient.percentage}%`,
                          backgroundColor: getRecipientColor(index),
                        }}
                        title={`${recipient.username}: ${recipient.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <div>0%</div>
                    <div>100%</div>
                  </div>
                </div>
                
                {/* Recipients List */}
                <div className="space-y-4">
                  {flow.weightedDistribution.map((recipient, index) => (
                    <div key={recipient.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={recipient.avatarUrl} />
                          <AvatarFallback style={{ backgroundColor: getRecipientColor(index) }}>
                            {recipient.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium">{recipient.username}</h4>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              {recipient.percentage}%
                            </Badge>
                          </div>
                          
                          {/* <p className="text-sm text-muted-foreground mb-3">
                            {recipient.description}
                          </p> */}
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Wallet: </span>
                              <span className="font-mono">{formatShortAddress(recipient.wallet)}</span>
                            </div>
                            {recipient.receivedAmount !== undefined && (
                              <div className="text-right">
                                <span className="text-muted-foreground">Received: </span>
                                <span className="font-medium">
                                  {formatCurrency(recipient.receivedAmount, flow.currencySymbol)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* {recipient.receivedAmount !== undefined && recipient.amount !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{Math.round((recipient.receivedAmount / recipient.amount) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(recipient.receivedAmount / recipient.amount) * 100} 
                                className="h-2"
                                style={{ 
                                  backgroundColor: "hsl(var(--muted))",
                                  "--progress-foreground": getRecipientColor(index)
                                } as React.CSSProperties}
                              />
                            </div>
                          )} */}
                          
                          {recipient.links && recipient.links.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {recipient.links.map((link, i) => (
                                <Button 
                                  key={i} 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 gap-1 text-xs"
                                  asChild
                                >
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    {link.title}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Distribution History */}
            {flow.distributionHistory && flow.distributionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribution History</CardTitle>
                  <CardDescription>Record of funds distributed to recipients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Recipient</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {flow.distributionHistory.map((distribution) => (
                          <tr key={distribution.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(distribution.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {distribution.recipientName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                              {formatCurrency(distribution.amount, flow.currencySymbol)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                                asChild
                              >
                                <a 
                                  href={`https://explorer.solana.com/tx/${distribution.transactionHash}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {formatShortAddress(distribution.transactionHash)}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Helper functions
function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge>Active</Badge>;
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    case 'paused':
      return <Badge variant="outline">Paused</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'active':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

function getRecipientColor(index: number): string {
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
  ];
  
  return colors[index % colors.length];
}

function formatShortAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}