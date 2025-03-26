"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppConstants } from "@/lib/app_constants";
import RaiseFlowForm from "@/components/flows/raise-flow-form";
import DistributeFlowForm from "@/components/flows/distribute-flow-form";

// Flow type constants
const FLOW_TYPES = {
  RAISE: "raise",
  DISTRIBUTE: "distribute"
};

export default function CreateFlowPage() {
  const router = useRouter();
  const [flowType, setFlowType] = useState(FLOW_TYPES.RAISE);
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create a New Flow</h1>
        <p className="text-muted-foreground">
          Set up a funding flow that matches your specific needs
        </p>
      </div>

      <Tabs 
        defaultValue={FLOW_TYPES.RAISE} 
        className="space-y-6"
        onValueChange={(value) => setFlowType(value)}
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value={FLOW_TYPES.RAISE}>Raise Funds</TabsTrigger>
          <TabsTrigger value={FLOW_TYPES.DISTRIBUTE}>Distribute Funds</TabsTrigger>
        </TabsList>

        <TabsContent value={FLOW_TYPES.RAISE}>
          <RaiseFlowForm onCancel={() => router.back()} />
        </TabsContent>

        <TabsContent value={FLOW_TYPES.DISTRIBUTE}>
          <DistributeFlowForm onCancel={() => router.back()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}