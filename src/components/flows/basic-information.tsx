"use client";

import { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CURRENCIES } from "@/lib/flow-constants";
import { FileVideo, FileImage, X, Upload, AlertCircle, Info, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppConstants } from "@/lib/app_constants";

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
                className="min-h-[120px]"
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
              <FormLabel>Funding Goal (Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10000" {...field} />
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
                  {AppConstants.SUPPORTEDCURRENCIES.map((currency) => (
                    <SelectItem key={currency.name} value={currency.name}>
                      <div className="flex items-center">
                        {/* <span className="mr-2">{currency.icon}</span> */}
                        <img
                          src={currency.logo}
                          alt={currency.name}
                          className="w-6 h-6 mr-2"/>
                        <span>{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Second row of paired fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
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
              <FormDescription>
                When the funding flow will go live
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration in Days (Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormDescription>
                How long the funding will be open
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Media Upload Section */}
      <div className="space-y-4 mt-8 border rounded-lg">
        {/* <h3 className="text-lg font-medium">Media</h3> */}
        {/* <FormDescription>
          You can upload up to 5 images (max 5MB each) and 1 video (max 50MB).
        </FormDescription> */}
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
        
        {/* Media metadata editor for the selected item would go here */}
        {(form.getValues('media')?.length > 0) && (
          <div className="mt-4 mx-4">
            <h4 className="text-sm font-medium">Media Description</h4>
            <FormDescription className="mt-1">
              Add descriptions to your media to provide context.
            </FormDescription>
            
            <div className="space-y-4 mt-2">
              {form.getValues('media')?.map((media: MediaItem) => (
                <div key={`desc-${media.id}`} className="flex gap-4 items-start">
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                    {media.type === 'image' ? (
                      <img 
                        src={media.previewUrl} 
                        alt={media.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-muted w-full h-full flex items-center justify-center">
                        <FileVideo className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{media.title}</p>
                    <Textarea
                      placeholder="Add a description for this media (optional)"
                      value={media.description || ''}
                      onChange={(e) => handleUpdateMediaMetadata(media.id, 'description', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}