import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VotingPowerModel } from "@/lib/types/funding_flow";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FundingFlowResponse } from "@/lib/types/funding_flow.response";
import { CheckCircle2, ChevronLeft, ChevronRight, DollarSign, InfoIcon, XIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  getVotingPowerModelDisplayName,
  getVotingPowerModelDescription
} from "@/lib/types/funding_flow";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FlowOverviewProps {
  flow: FundingFlowResponse;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export function FlowOverview({ flow }: FlowOverviewProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);


  // Add the useEffect to process media items
  useEffect(() => {
    const media: MediaItem[] = [];

    // Process images if they exist
    if (flow.images && flow.images.length > 0) {
      flow.images.forEach(imageUrl => {
        media.push({
          type: 'image',
          url: imageUrl
        });
      });
    }

    // Process video if it exists
    if (flow.video) {
      media.push({
        type: 'video',
        url: flow.video
      });
    }

    setMediaItems(media);
  }, [flow]);

  // Get voting power model display name
  const getVotingPowerModelName = (model: VotingPowerModel) => {
    switch (model) {
      case VotingPowerModel.TOKEN_WEIGHTED:
        return "Token Weighted";
      case VotingPowerModel.QUADRATIC_VOTING:
        return "Quadratic Voting";
      case VotingPowerModel.INDIVIDUAL_VOTING:
        return "Individual Voting";
      default:
        return "Unknown";
    }
  };

  // Get milestone status color
  const getStatusColor = (index: number) => {
    if (!flow.completed_milestones) return "bg-gray-400";
    if (index < flow.completed_milestones) return "bg-green-500";
    return "bg-gray-400";
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      {flow.rules.milestone && (
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
      )}

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <div className="flex">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">{flow.title}</h1>
              <div className="mx-2">
                <Badge className="mt-1">{flow.status}</Badge>
              </div>
            </div>
            <div className="md:hidden flex items-center text-muted-foreground text-xs">
              <Avatar className="h-6 w-6 mr-1">
                <AvatarImage src={flow.users?.profile_pics} alt={flow.users?.name} />
                <AvatarFallback>{flow.users?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{flow.users?.username}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{flow.description}</p>
          </CardContent>
        </Card>

        {/* Flow Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Flow Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {/* <div className="flex flex-col py-2">
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="flex items-center gap-2">
                  {getStatusBadge(flow.status)}
                </dd>
              </div> */}
              <div className="flex flex-col py-2">
                <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                <dd>{formatDate(flow.startdate)}</dd>
              </div>
              <div className="flex flex-col py-2">
                <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                <dd>{flow.enddate ? formatDate(flow.enddate) : "No end date"}</dd>
              </div>
              <div className="flex flex-col py-2">
                <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
                <dd>{flow.currency}</dd>
              </div>
              <div className="flex flex-col py-2">
                <dt className="text-sm font-medium text-muted-foreground">Rules</dt>
                <dd>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {flow.rules.milestone && (
                      <Badge variant="outline">Milestone Based</Badge>
                    )}
                    {flow.rules.governance && (
                      <Badge variant="outline">Weighted Distribution</Badge>
                    )}
                    {!flow.rules.milestone && !flow.rules.governance && (
                      <Badge variant="outline">No Rules configured</Badge>
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Flow Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{flow.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Start Date</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(flow.startdate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">End Date</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(flow.enddate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p className="text-sm text-muted-foreground capitalize">{flow.status}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Voting Model</h4>
                  <p className="text-sm text-muted-foreground">
                    {getVotingPowerModelName(flow.votingPowerModel)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Media Card */}
        {mediaItems && mediaItems.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Media</CardTitle>
                <CardDescription>Photos and videos</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setActiveMediaIndex((prev) =>
                      prev === 0 ? mediaItems!.length - 1 : prev - 1
                    );
                  }}
                  disabled={mediaItems.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {activeMediaIndex + 1} / {mediaItems.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => {
                    setActiveMediaIndex((prev) =>
                      prev === mediaItems!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  disabled={mediaItems.length <= 1}
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
                  {mediaItems.map((item, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={"Flow image"}
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === 'video' ? (
                        <div className="w-full h-full bg-black">
                          <iframe
                            src={item.url}
                            title={"Flow video"}
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
                      prev === 0 ? mediaItems!.length - 1 : prev - 1
                    );
                  }}
                  disabled={mediaItems.length <= 1}
                >
                  <ChevronLeft className="h-8 w-8 drop-shadow-md" />
                </button>

                <button
                  className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end px-2 text-white bg-gradient-to-l from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setActiveMediaIndex((prev) =>
                      prev === mediaItems!.length - 1 ? 0 : prev + 1
                    );
                  }}
                  disabled={mediaItems.length <= 1}
                >
                  <ChevronRight className="h-8 w-8 drop-shadow-md" />
                </button>
              </div>

              {/* Caption for current media */}
              {/* {(mediaItems[activeMediaIndex].title || mediaItems[activeMediaIndex].description) && (
                <div className="mt-3 space-y-1 px-1">
                  {mediaItems[activeMediaIndex].title && (
                    <h4 className="text-sm font-medium">{mediaItems[activeMediaIndex].title}</h4>
                  )}
                  {mediaItems[activeMediaIndex].description && (
                    <p className="text-sm text-muted-foreground">{mediaItems[activeMediaIndex].description}</p>
                  )}
                </div>
              )} */}

              {/* Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 px-1">
                  {mediaItems.map((item, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border",
                        activeMediaIndex === index ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                      )}
                      onClick={() => setActiveMediaIndex(index)}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.url || `https://img.youtube.com/vi/${item.url.split('/').pop()}/mqdefault.jpg`}
                            alt={`Video ${index + 1}`}
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
          {
            (flow.rules.milestone || flow.rules.governance) && (
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Funding Rules</CardTitle>
              </CardHeader>
            )
          }
          {
            flow.rules.milestone && (
              <CardContent>
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
                    </div>
                  </div>
                )}

              </CardContent>
            )
          }
          {flow.rules.governance && (
            <CardContent>
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Governance</h4>
                  <p className="text-sm text-muted-foreground">
                    Funds are governed by the community through voting.
                  </p>

                  <div className="mt-2 flex items-center">
                    <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-md font-medium">
                      {getVotingPowerModelDisplayName(flow.voting_power_model)}
                    </span>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full h-5 w-5 ml-1.5 hover:bg-muted"
                        >
                          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="sr-only">About this voting model</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="right"
                        align="start"
                        sideOffset={10}
                        className="w-72 p-4 z-50"
                        avoidCollisions={true}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">About this voting model</h4>
                            <PopoverTrigger asChild>
                              <button className="h-5 w-5 inline-flex items-center justify-center rounded-full hover:bg-muted">
                                <XIcon className="h-3 w-3" />
                                <span className="sr-only">Close</span>
                              </button>
                            </PopoverTrigger>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getVotingPowerModelDescription(flow.voting_power_model)}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>



      </TabsContent>

      {/* Milestones Tab */}
      {flow.rules.milestone && (
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
                {flow.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {index < (flow.milestones?.length || 0) - 1 && (
                      <div className="absolute top-6 left-3 w-px h-full bg-border -z-10"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`relative rounded-full h-6 w-6 flex items-center justify-center ${getStatusColor(index)} text-white`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{milestone.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(milestone.amount, flow.currency)} •
                              Due by {formatDate(milestone.deadline)}
                            </p>
                          </div>
                          <div>
                            {index < (flow.completed_milestones || 0) && (
                              <span className="text-green-500 text-sm">Completed</span>
                            )}
                          </div>
                        </div>
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
  );
}