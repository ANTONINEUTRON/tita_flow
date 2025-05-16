import React, { useEffect, useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, MessageSquare, Plus, ThumbsUp } from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Flow, Update } from "@/lib/types/typesbbbb";
import { formatDate } from "@/lib/utils";
import { fetchFlowData } from "@/lib/data/flow_item_data";
import { FundingFlowResponse } from "@/lib/types/flow.response";

interface UpdatesViewProps {
  flow: FundingFlowResponse;
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  onCreateUpdate?: (content: string, attachments: File[]) => Promise<void>;
  onComment?: (updateId: string, content: string) => Promise<void>;
  onLike?: (updateId: string) => Promise<void>;
}

export function UpdatesView({ 
  // flow, 
  currentUser,
  onCreateUpdate,
  onComment,
  onLike
}: UpdatesViewProps) {
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const flow = fetchFlowData("1");
  // const [flow, setFlow] = useState<Flow>()
  
  // useEffect(()=>{
  //   fetchFlowData("1").then(data => {
  //     setFlow(data);
  //   });
  // })
    
  const updates = flow!.updates || [];
  
  const isCreator = true;//currentUser?.id === flow!.creator.id;
  
  const handleCreateUpdate = async () => {
    if (!onCreateUpdate || !newUpdateContent.trim()) return;
    
    try {
      await onCreateUpdate(newUpdateContent, attachments);
      setNewUpdateContent('');
      setAttachments([]);
      setIsCreatingUpdate(false);
    } catch (error) {
      console.error('Failed to create update:', error);
    }
  };
  
  const handleAddComment = async (updateId: string) => {
    if (!onComment) return;
    
    const content = commentText[updateId];
    if (!content || !content.trim()) return;
    
    try {
      await onComment(updateId, content);
      setCommentText(prev => ({ ...prev, [updateId]: '' }));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  const handleLike = async (updateId: string) => {
    if (!onLike) return;
    
    try {
      await onLike(updateId);
    } catch (error) {
      console.error('Failed to like update:', error);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  
  const toggleExpandUpdate = (updateId: string) => {
    setExpandedUpdateId(expandedUpdateId === updateId ? null : updateId);
  };
  
  if (updates.length === 0 && !isCreator) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-10">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Updates Yet</h3>
        <p className="text-muted-foreground mb-6">
          There are no updates for this flow yet. Check back later for news and progress updates.
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Updates</h2>
          <p className="text-muted-foreground">
            {updates.length} update{updates.length !== 1 ? 's' : ''} from the flow creator
          </p>
        </div>
        
        {isCreator && (
          <Dialog open={isCreatingUpdate} onOpenChange={setIsCreatingUpdate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Update
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Update</DialogTitle>
                <DialogDescription>
                  Share news, progress, or important information with your contributors.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="What's the latest on your project?"
                  value={newUpdateContent}
                  onChange={(e) => setNewUpdateContent(e.target.value)}
                  className="min-h-[150px]"
                />
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments (optional)</Label>
                  <Input 
                    id="attachments" 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                  />
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        {attachments.length} file{attachments.length !== 1 ? 's' : ''} selected:
                      </p>
                      <ul className="text-sm space-y-1">
                        {attachments.map((file, index) => (
                          <li key={index} className="flex items-center">
                            <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-muted-foreground ml-1">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingUpdate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUpdate} disabled={!newUpdateContent.trim()}>
                  Post Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="space-y-6">
        {updates.length === 0 && isCreator ? (
          <Card className="flex flex-col items-center justify-center text-center p-10">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Updates Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't posted any updates for this flow yet. Keep your contributors informed about your progress!
            </p>
            <Button onClick={() => setIsCreatingUpdate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Update
            </Button>
          </Card>
        ) : (
          updates.map((update: Update) => (
            <Card key={update.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={update.author.avatarUrl} alt={update.author.name} />
                      <AvatarFallback>{update.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{update.author.name}</span>
                        {update.author.id === flow!.creator.id && (
                          <Badge variant="outline">Creator</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(update?.createdAt ?? "")}
                      </p>
                    </div>
                  </div>
                  
                  {isCreator && update.author.id === currentUser?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <EllipsisVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Update</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Update</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="whitespace-pre-line">{update.content}</div>
                
                {update.attachments && update.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {update.attachments.map((attachment) => (
                      <a
                        key={attachment.url}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[150px]">{attachment.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col items-stretch pt-1">
                <div className="flex items-center gap-2 py-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground h-8"
                    onClick={() => handleLike(update.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>Like</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground h-8"
                    onClick={() => toggleExpandUpdate(update.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>
                      {update.comments && update.comments.length > 0 
                        ? `Comments (${update.comments.length})`
                        : "Comment"}
                    </span>
                  </Button>
                </div>
                
                {expandedUpdateId === update.id && (
                  <>
                    <Separator />
                    {update.comments && update.comments.length > 0 && (
                      <div className="py-3 space-y-3">
                        {update.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-secondary p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                    {comment.author.id === flow!.creator.id && (
                                      <Badge variant="outline" className="text-[10px] h-4 px-1">Creator</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment?.createdAt ?? "")}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {currentUser && (
                      <div className="flex gap-3 pt-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={commentText[update.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [update.id]: e.target.value }))}
                            className="min-h-[80px] flex-1"
                          />
                          <Button 
                            className="self-end" 
                            onClick={() => handleAddComment(update.id)}
                            disabled={!commentText[update.id]?.trim()}
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}