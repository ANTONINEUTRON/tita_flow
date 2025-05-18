import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Copy, Check, Wallet, User, Loader2, LogOut } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import useProfile from "@/lib/hooks/use_profile";
import WalletCard from "./wallet_card";

// Simplified form schema for only editable fields
const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profilePics: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function TabAccount() {
  const { userProfile, updateUserProfile, loading, signUserOut, supportedCurrenciesBalances, fetchUserBalance } = useProfile();
  const [copied, setCopied] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form with user data
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: userProfile?.name || "",
      profilePics: userProfile?.profile_pics || "",
      username: userProfile?.username || "",
    },
  });
  
  // Update form when profile data changes
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || "",
        profilePics: userProfile.profile_pics || "",
        username: userProfile.username || ""
      });
    }
  }, [userProfile, form]);
  
  // Handle form submission - only update name and profilePics
  const onSubmit = async (data: AccountFormValues) => {
    try {
      if (!userProfile) return;
      
      await updateUserProfile(userProfile.id,{
        name: data.name,
        profilePics: data.profilePics || "",
        username: data.username,
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  
  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    // Validate file type
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast.error("Unsupported file format. Please use JPG, PNG, or GIF.");
      return;
    }
    
    try {
      // Show immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Start upload
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userProfile?.id!);
      
      // Upload the file
      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }
      
      // Get the uploaded file URL
      const data = await response.json();
      
      // Update the form field with the new URL
      form.setValue("profilePics", data.url, { 
        shouldValidate: true,
        shouldDirty: true,
      });
      
      // Clear the input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast.success("Profile image uploaded successfully");
      
      // Clean up preview URL as we now have the real URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Add cleanup for any preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account details and wallet information</p>
      </div>
      
      <Separator />
      
      {/* Profile Preview - Shows current settings */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userProfile.profile_pics || ""} alt={userProfile.name || "User"} />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{userProfile.name || userProfile.username}</h4>
          <p className="text-sm text-muted-foreground">{userProfile.email || ""}</p>
        </div>
      </div>


      {/* Wallet Section */}
      <WalletCard 
        user={userProfile}
        supportedCurrenciesBalances={supportedCurrenciesBalances}
        fetchBalance={fetchUserBalance}/>
      
      {/* Wallet Information - Read Only */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              <Wallet className="h-4 w-4 inline mr-2" />
              Wallet Information
            </CardTitle>
            <Badge variant="outline" className="text-xs">Read-only</Badge>
          </div>
          <CardDescription>Your blockchain identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <div className="flex items-center gap-2">
              <div className="flex-grow p-2 bg-muted rounded-md font-mono text-xs sm:text-sm border border-input overflow-x-auto">
                {userProfile.wallet || "No wallet connected"}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => copyToClipboard(userProfile.wallet || "", "Wallet address")}
                disabled={!userProfile.wallet}
              >
                {copied === "Wallet address" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <div className="flex items-center gap-2">
              <Input
                id="user-id"
                value={userProfile.id || ""}
                readOnly
                className="font-mono text-xs bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => copyToClipboard(userProfile.id || "", "User ID")}
              >
                {copied === "User ID" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Read-only Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm">{userProfile.email || "No email provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Editable Information - Just name and profilePics */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Editable Information</CardTitle>
              <CardDescription>Update your display name and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how you'll appear to others in the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Profile Picture URL */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* File Upload for Profile Picture */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="profile-image-upload">Upload Profile Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="flex-1"
                    disabled={isUploading}
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>
              
              {/* Preview of profile picture */}
              {(form.watch("profilePics") || previewUrl) && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex justify-center p-4 border rounded-md">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={previewUrl || form.watch("profilePics")} 
                        alt="Profile Preview" 
                      />
                      <AvatarFallback>
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Form Actions with Logout */}
            <CardFooter className="w-full">
              <div className="flex justify-between pt-6 border-t mt-6 w-full">
                <Button
                  type="submit"
                  disabled={loading || !form.formState.isDirty}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                
                <Button variant="destructive" type="button" onClick={() => signUserOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      
    </div>
  );
}