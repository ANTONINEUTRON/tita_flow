import { Flow } from "../../lib/types/types";
import { formatCurrency, formatDate, getStatusBadge, getStatusColor } from "../../lib/utils";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, ChevronLeft, ChevronRight, Clock, Coins, DollarSign, 
  Calendar, FileText, ExternalLink, Users 
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>About This Flow</CardTitle>
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
                  <CardTitle>Media</CardTitle>
                  <CardDescription>Photos and videos related to this flow</CardDescription>
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
                            onClick={onViewRecipients}
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
      </Tabs>
    </div>
  );
}