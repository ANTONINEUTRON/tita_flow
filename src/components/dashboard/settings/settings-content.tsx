import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import TabAccount from "./tab-account";
import TabWallet from "./tab-wallet";
import TabNotifications from "./tab-notifications";

// export interface SettingsTabsProp{
//   handleSave: ()=>void;
//   loading: boolean;
// }

export function SettingsContent() {

  // const [loading, setLoading] = useState(false);

  // const handleSave = () => {
  //   setLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);
  // };

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