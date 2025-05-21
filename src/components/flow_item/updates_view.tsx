import React, { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileIcon, FileTextIcon, Loader2, MessageSquareIcon, PaperclipIcon, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FundingFlowResponse } from "@/lib/types/flow.response";
import AppUser from "@/lib/types/user";
import useUpdates from "@/lib/hooks/use_updates";
import { v4 } from "uuid";
import toast from "react-hot-toast";
import { UpdateResponse } from "@/lib/types/update.response";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface UpdatesViewProps {
  flow: FundingFlowResponse;
  currentUser: AppUser;
  onCreateUpdate?: (content: string, attachments: File[]) => Promise<void>;
  onComment?: (updateId: string, content: string) => Promise<void>;
  onLike?: (updateId: string) => Promise<void>;
  updates: UpdateResponse[];
  refreshUpdates: (flowId: string) => Promise<void>;
}

export function UpdatesView({
  flow, 
  updates,
  currentUser,
  refreshUpdates,
}: UpdatesViewProps) {
  const [commentText, setCommentText] = useState<string>('');
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateResponse | null>(null);
  const { 
    createUpdate, 
    uploadFile, 
    addComment, 
    fetchComments, 
    comments, 
    loadingComments,
    loading 
  } = useUpdates();

  const isCreator = currentUser.id === flow.users.id;

  useEffect(() => {
    if (selectedUpdate && sidebarOpen) {
      fetchComments(selectedUpdate.id)
        .catch((error) => {
          console.error('Failed to fetch comments:', error);
          toast.error("Failed to fetch comments");
        });
    }
  }, [sidebarOpen, selectedUpdate]);

  // Open sidebar with selected update
  const openSidebar = (update: UpdateResponse) => {
    setSelectedUpdate(update);
    setSidebarOpen(true);
  };
  
  const handleCreateUpdate = async () => {
    if (!newUpdateContent.trim()) return;

    if (!newUpdateContent.trim()) {
      toast.error("Update content cannot be empty");
      return;
    }
    
    if (attachments.length > 3) {
      toast.error("You can only attach up to 3 files");
      return;
    }

    try {
      
      await createUpdate({
        id: v4(),
        description: newUpdateContent,
        flow_id: flow.id,
        user_id: currentUser.id,
        files: await uploadFile(attachments, flow.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      refreshUpdates(flow!.id);

      toast.success("Update created successfully");

      setNewUpdateContent('');
      setAttachments([]);
      setIsCreatingUpdate(false);
    } catch (error) {
      console.error('Failed to create update:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedUpdate || !commentText.trim()) return;

    try {
      await addComment({
        id: v4(),
        update_id: selectedUpdate.id,
        user_id: currentUser.id,
        content: commentText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setCommentText('');
      // refreshUpdates(flow.id);
      // toast.success("Comment added");
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Create Update Button & Form */}
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
              <Button className="display-none md:inline-flex">
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
                <div className="flex items-center gap-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80">
                      <PaperclipIcon className="h-4 w-4" />
                      <span>Attach Files</span>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setAttachments(Array.from(e.target.files).slice(0, 3));
                        }
                      }}
                      className="hidden"
                    />
                  </Label>

                  {attachments.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {attachments.length} file{attachments.length > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => setIsCreatingUpdate(false)}>
                  Cancel
                </Button>
                <Button
                  isLoading={loading}
                  onClick={handleCreateUpdate}
                  disabled={!newUpdateContent.trim()}>
                  Post Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <Card className="p-8 flex flex-col items-center justify-center">
            <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No updates yet</p>
            <p className="text-muted-foreground">Check back later for project updates</p>
            {
              isCreator && (
                <Button onClick={() => setIsCreatingUpdate(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Update
                </Button>
              )
            }
          </Card>
        ) : (
          updates.map((update) => (
            <Card 
              key={update.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openSidebar(update)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={update.users?.profile_pics || ''} />
                      <AvatarFallback>{update.users?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{update.users?.username || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="line-clamp-3">{update.description}</p>
                
                {/* Attachment and comment indicators */}
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  {update.files?.length > 0 && (
                    <div className="flex items-center mr-4">
                      <PaperclipIcon className="h-4 w-4 mr-1" />
                      <span>{update.files.length} attachment{update.files.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {(update.comments?.length ?? 0) > 0 && (
                    <div className="flex items-center">
                      <MessageSquareIcon className="h-4 w-4 mr-1" />
                      <span>{update.comments!.length} comment{update.comments!.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Right Sidebar for Update Details */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle>Update Details</SheetTitle>
            <SheetClose className="absolute right-4 top-4" />
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Update header */}
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={selectedUpdate?.users?.profile_pics || ''} />
                <AvatarFallback>{selectedUpdate?.users?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUpdate?.users?.username || 'Unknown User'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(selectedUpdate?.created_at || Date.now()), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Update description */}
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{selectedUpdate?.description}</p>
            </div>
            
            {/* Files/attachments section (if present) */}
            {selectedUpdate?.files && selectedUpdate.files.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Attachments ({selectedUpdate.files.length})</h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedUpdate.files.map((file, idx) => (
                    <div key={idx} className="border rounded-md overflow-hidden">
                      {file.type === 'image' ? (
                        // Display image preview
                        <div className="space-y-2">
                          <div className="relative w-full h-48">
                            <img
                              src={file.url} 
                              alt="Attached image" 
                              className="object-cover w-full h-full rounded-t-md"
                            />
                          </div>
                          <div className="p-2 flex justify-between">
                            <a 
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="text-xs text-primary hover:underline"
                            >
                              View full size
                            </a>
                          </div>
                        </div>
                      ) : file.type === 'video' ? (
                        // Display video player
                        <div className="space-y-2">
                          <video 
                            controls 
                            className="w-full rounded-t-md"
                            preload="metadata"
                          >
                            <source src={file.url} />
                            Your browser does not support the video tag.
                          </video>
                          <div className="p-2 flex justify-between">
                            <span className="text-xs truncate">
                              {file.url.split('/').pop() || 'Video'}
                            </span>
                            <a 
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        // Other file types
                        <a 
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="flex items-center p-4 hover:bg-muted"
                        >
                          <div className="bg-muted rounded-md p-2 mr-3">
                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.url.split('/').pop() || 'File'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Click to download
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment input */}
            {currentUser && (
              <div className="border-t p-4 mt-auto">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    disabled={!commentText.trim()}
                    onClick={handleAddComment}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
            
            {/* Comments section would go here */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Comments ({comments?.length || 0})</h4>
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <Avatar>
                      <AvatarImage src={comment.users?.profile_pics || ''} />
                      <AvatarFallback>{comment.users?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{comment.users?.username || 'Unknown User'}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.updated_at!), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
              </div>
          </div>
          {
            loadingComments && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="loader">Loading...</div>
              </div>
            )
          }
        </SheetContent>
      </Sheet>
    </div>
  );
}