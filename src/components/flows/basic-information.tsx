"use client";

import { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileVideo, FileImage, X, AlertCircle, Info, ChevronUp, ChevronDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppConstants } from "@/lib/app_constants";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar"; 
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";


// Define types for media items
type MediaItem = {
  id: string;
  file: File;
  type: 'image' | 'video';
  previewUrl: string;
  title: string;
  description?: string;
};

type BasicInformationProps = {
  form: any;
  minDateString: string;
};

const VIDEO_MAX_SIZE_MB = 50;
const IMAGE_MAX_SIZE_MB = 2;
const MAX_IMAGES = 5;

export function BasicInformation({ form, minDateString, }: BasicInformationProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [isEndDateTooltipOpen, setIsEndDateTooltipOpen] = useState(false);
  const [isStartDateTooltipOpen, setIsStartDateTooltipOpen] = useState(false);
  
  // Handle media file selection
  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video') => {
    setUploadError(null);
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    // Get current media from form
    const currentMedia = form.getValues('media') || [];
    
    // Check limits based on media type
    if (mediaType === 'video') {
      // Check if a video already exists
      const existingVideos = currentMedia.filter((item: MediaItem) => item.type === 'video');
      if (existingVideos.length > 0) {
        setUploadError("Only one video is allowed. Please remove the existing video first.");
        event.target.value = '';
        return;
      }
      
      // Check video size
      const file = files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > VIDEO_MAX_SIZE_MB) {
        setUploadError(`Video size exceeds the ${VIDEO_MAX_SIZE_MB}MB limit.`);
        event.target.value = '';
        return;
      }
    } else {
      // For images, check count limit
      const existingImages = currentMedia.filter((item: MediaItem) => item.type === 'image');
      if (existingImages.length + files.length > MAX_IMAGES) {
        setUploadError(`Only ${MAX_IMAGES} images are allowed.`);
        event.target.value = '';
        return;
      }
      
      // Check each image size
      for (let i = 0; i < files.length; i++) {
        const fileSizeMB = files[i].size / (1024 * 1024);
        if (fileSizeMB > IMAGE_MAX_SIZE_MB) {
          setUploadError(`Image "${files[i].name}" exceeds the ${IMAGE_MAX_SIZE_MB}MB limit.`);
          event.target.value = '';
          return;
        }
      }
    }
    
    // Process valid files
    Array.from(files).forEach(file => {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Create new media item
      const newMediaItem: MediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: mediaType,
        previewUrl,
        title: file.name.split('.')[0], // Default title is filename without extension
        description: '',
      };
      
      // Add to form state
      form.setValue('media', [...currentMedia, newMediaItem]);
    });
    
    // Reset file input
    event.target.value = '';
  };
  
  // Handle removing media
  const handleRemoveMedia = (id: string) => {
    const currentMedia = form.getValues('media') || [];
    const mediaToRemove = currentMedia.find((item: MediaItem) => item.id === id);
    
    // Revoke object URL to prevent memory leaks
    if (mediaToRemove) {
      URL.revokeObjectURL(mediaToRemove.previewUrl);
    }
    
    // Update form state
    form.setValue(
      'media', 
      currentMedia.filter((item: MediaItem) => item.id !== id)
    );
    
    // Clear any errors
    setUploadError(null);
  };
  
  // Handle updating media metadata (title, description)
  const handleUpdateMediaMetadata = (id: string, field: 'title' | 'description', value: string) => {
    const currentMedia = form.getValues('media') || [];
    const updatedMedia = currentMedia.map((item: MediaItem) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    
    form.setValue('media', updatedMedia);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter a title for your flow"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={ "Describe what you're raising funds for..."} 
                className="min-h-[120px] resize-y"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* First row of paired fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Goal</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  {...field} />
              </FormControl>
              {/* <FormDescription>
                  The total amount you want to raise
                </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AppConstants.SUPPORTEDCURRENCIES.map((currency) => {
                    if(!currency.canBeUsed)return;

                    return (
                      <SelectItem key={currency.name} value={currency.name}>
                        <div className="flex items-center">
                          <img
                            src={currency.logo}
                            alt={currency.name}
                            className="w-6 h-6 mr-2" />
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Second row of paired fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <FormField
          control={form.control}
          name="startdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={minDateString}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input 
                  type="date"
                  min={form.watch("startdate") || minDateString} 
                  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        {/* Start Date */}
        <FormField
          control={form.control}
          name="startdate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(minDateString)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div>
                <TooltipProvider>
                  <Tooltip 
                    open={isStartDateTooltipOpen}
                    onOpenChange={setIsStartDateTooltipOpen}
                    delayDuration={300}>
                    <TooltipTrigger asChild>
                      <InfoIcon 
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                        onClick={() => setIsStartDateTooltipOpen(!isStartDateTooltipOpen)} />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right"
                      className="max-w-xs"
                      sideOffset={5}
                      onClick={() => setIsStartDateTooltipOpen(false)}>
                      <p>
                        The date when your funding flow will start
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center justify-between">
                <FormLabel>End Date</FormLabel>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={(e) => {
                        // If we have a value and user clicks, clear it
                        if (field.value && e.target === e.currentTarget) {
                          e.preventDefault();
                          field.onChange("");
                        }
                      }}
                    >
                      {field.value ? (
                        <>
                          {format(new Date(field.value), "PPP")}
                          <X
                            className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange("");
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>No end date (long-running flow)</span>
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(minDateString) ||
                      (form.getValues("startdate") && date <= new Date(form.getValues("startdate")))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div>
                <TooltipProvider>
                  <Tooltip 
                    open={isEndDateTooltipOpen}
                    onOpenChange={setIsEndDateTooltipOpen} 
                    delayDuration={300}>
                    <TooltipTrigger asChild>
                      <InfoIcon 
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                        onClick={() => setIsEndDateTooltipOpen(!isEndDateTooltipOpen)} />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="max-w-xs"
                      onClick={() => setIsEndDateTooltipOpen(false)} 
                      sideOffset={5}>
                      <p>
                        Optional target date for project completion. Flow remains open after this date.
                      </p>
                      <p className="mt-1"> 
                        Funders will be notified when this date is reached for review purposes.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <FormMessage />
              </div>
              
              <FormMessage />
            </FormItem>
          )}
        />

      </div>
      
      {/* Media Upload Section */}
      <div className="space-y-4 mt-8 border rounded-lg">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setIsMediaExpanded(!isMediaExpanded)}
        >
          <div>
            <h4 className="font-medium text-sm">Media</h4>
            <FormDescription className="text-xs text-muted-foreground">
              Add images or videos to showcase your project
            </FormDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button">
            {isMediaExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {
          isMediaExpanded && (
            <FormField
              control={form.control}
              name="media"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap gap-4 px-4">
                    {/* Video upload button */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Input
                          type="file"
                          id="video-upload"
                          className="sr-only"
                          accept="video/*"
                          onChange={(e) => handleMediaSelect(e, 'video')}
                        />
                        <label
                          htmlFor="video-upload"
                          className={cn(
                            "flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg cursor-pointer",
                            "transition-colors duration-200 ease-in-out",
                            "hover:bg-muted",
                            (field.value?.some((item: MediaItem) => item.type === 'video')) ?
                              "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          <FileVideo className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-center text-muted-foreground">Upload video<br />(max 50MB)</span>
                        </label>
                      </div>
                    </div>

                    {/* Image upload button */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Input
                          type="file"
                          id="image-upload"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleMediaSelect(e, 'image')}
                        />
                        <label
                          htmlFor="image-upload"
                          className={cn(
                            "flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg cursor-pointer",
                            "transition-colors duration-200 ease-in-out",
                            "hover:bg-muted",
                            (field.value?.filter((item: MediaItem) => item.type === 'image')?.length >= MAX_IMAGES) ?
                              "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          <FileImage className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-center text-muted-foreground">Upload images<br />(max {MAX_IMAGES} images, {IMAGE_MAX_SIZE_MB}MB each)</span>
                        </label>
                      </div>
                    </div>

                    {/* Media preview */}
                    {field.value?.map((media: MediaItem) => (
                      <div key={media.id} className="relative">
                        <div className="w-40 h-40 border rounded-lg overflow-hidden">
                          {media.type === 'image' ? (
                            <img
                              src={media.previewUrl}
                              alt={media.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={media.previewUrl}
                              className="w-full h-full object-cover"
                              controls
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(media.id)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Input
                          placeholder="Title"
                          value={media.title}
                          onChange={(e) => handleUpdateMediaMetadata(media.id, 'title', e.target.value)}
                          className="mt-2 text-xs px-2 py-1 h-7"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="m-2 text-xs text-muted-foreground flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    {field.value?.filter((item: MediaItem) => item.type === 'image').length || 0} of {MAX_IMAGES} images,
                    {field.value?.some((item: MediaItem) => item.type === 'video') ? " 1" : " 0"} of 1 video
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }
        
      </div>
    </div>
  );
}