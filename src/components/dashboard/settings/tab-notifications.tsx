import { useState } from "react";
import { toast } from "react-hot-toast";
import { BellRing, Mail, Globe, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useProfile from "@/lib/hooks/use_profile";

// Schema for the preferences form
const preferencesFormSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
  displayCurrency: z.string().min(1, "Please select a currency"),
  timezone: z.string().min(1, "Please select a timezone"),
  language: z.string().min(1, "Please select a language"),
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export default function TabNotifications() {
  const { userProfile, updateUserProfile, loading } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize with default preferences or user's saved preferences
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      notifications: {
        email: userProfile?.preferences?.notifications?.email ?? true,
        push: userProfile?.preferences?.notifications?.push ?? true,
        marketing: userProfile?.preferences?.notifications?.marketing ?? false,
      },
      displayCurrency: userProfile?.preferences?.displayCurrency || "USD",
      timezone: userProfile?.preferences?.timezone || "UTC",
      language: userProfile?.preferences?.language || "en",
    },
  });
  
  // When a notification setting is toggled
  const handleNotificationChange = async (type: 'email' | 'push' | 'marketing', checked: boolean) => {
    try {
      if (!userProfile) return;
      
      // Create a new preferences object with the updated notification setting
      const updatedPreferences = {
        ...userProfile.preferences || {},
        notifications: {
          ...(userProfile.preferences?.notifications || { email: true, push: true, marketing: false }),
          [type]: checked,
        },
      };
      
      // Update the form value
      form.setValue(`notifications.${type}`, checked, { shouldDirty: true });
      
      // Only update profile if there's an actual change
      await updateUserProfile(userProfile.id,{
        ...userProfile,
        preferences: updatedPreferences,
      });
    } catch (error) {
      console.error(`Error updating ${type} notification setting:`, error);
      toast.error(`Failed to update ${type} notification setting`);
    }
  };
  
  // Submit handler for the form (handles non-switch settings like currency, timezone)
  const onSubmit = async (data: PreferencesFormValues) => {
    try {
      if (!userProfile) return;
      
      setIsSubmitting(true);
      
      // Update user profile with new preferences
      await updateUserProfile(userProfile.id, {
        preferences: {
          ...userProfile.preferences,
          ...data,
        },
      });
      
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BellRing className="h-4 w-4 mr-2" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates and alerts via email
                    </div>
                  </div>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={form.watch("notifications.email")}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                  disabled={loading}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifications" className="flex items-center space-x-3">
                  <BellRing className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </div>
                  </div>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={form.watch("notifications.push")}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                  disabled={loading}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="marketing-emails" className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Marketing Emails</div>
                    <div className="text-sm text-muted-foreground">
                      Receive marketing emails about new features and offers
                    </div>
                  </div>
                </Label>
                <Switch
                  id="marketing-emails"
                  checked={form.watch("notifications.marketing")}
                  onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>
          
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Display Preferences
              </CardTitle>
              <CardDescription>
                Customize how information is displayed to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="displayCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Currency used to display amounts across the platform
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="ET">ET (Eastern Time)</SelectItem>
                        <SelectItem value="CT">CT (Central Time)</SelectItem>
                        <SelectItem value="MT">MT (Mountain Time)</SelectItem>
                        <SelectItem value="PT">PT (Pacific Time)</SelectItem>
                        <SelectItem value="GMT">GMT (Greenwich Mean Time)</SelectItem>
                        <SelectItem value="CET">CET (Central European Time)</SelectItem>
                        <SelectItem value="JST">JST (Japan Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Times will be displayed in this timezone
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="ja">Japanese</SelectItem>
                                        <SelectItem value="zh">Chinese</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Language used throughout the application
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={loading || isSubmitting || !form.formState.isDirty}
                    >
                        {isSubmitting ? "Saving..." : "Save Preferences"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form >
    </div >
  );
}