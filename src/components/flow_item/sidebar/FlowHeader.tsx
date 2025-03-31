import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Flow } from "../../../lib/types/types";

interface FlowHeaderProps {
  flow: Flow;
}

export function FlowHeader({ flow }: FlowHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="space-y-1">
        {/* <CardTitle className="text-2xl font-bold truncate" title={flow.title}>
          {flow.title}
        </CardTitle> */}
        <div className="flex items-center text-muted-foreground text-sm mt-2">
          <Avatar className="h-5 w-5 mr-2">
            <AvatarImage src={flow.creator.avatarUrl} alt={flow.creator.name} />
            <AvatarFallback>{flow.creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{flow.creator.name}</span>
        </div>
      </div>
    </CardHeader>
  );
}