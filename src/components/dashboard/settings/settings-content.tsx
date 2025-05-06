import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabAccount from "./tab-account";
import TabNotifications from "./tab-notifications";


export function SettingsContent() {

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <TabAccount />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <TabNotifications />
        </TabsContent>
        
      </Tabs>
    </div>
  );
}