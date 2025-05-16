import React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NavItem } from "../../../lib/types/typesbbbb";

interface SidebarNavigationProps {
  navItems: NavItem[];
  activeView: string;
  onNavigate: (view: string) => void;
}

export function SidebarNavigation({ navItems, activeView, onNavigate }: SidebarNavigationProps) {
  return (
    <nav className="space-y-1 mt-2">
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => onNavigate(item.href)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
            activeView === item.href
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="flex items-center">
            <item.icon className="h-4 w-4 mr-3" />
            <span>{item.title}</span>
          </div>
          {item.badge ? (
            <Badge 
              variant={activeView === item.href ? "outline" : "secondary"} 
              className="text-[10px] px-2 h-5"
            >
              {item.badge}
            </Badge>
          ) : (
            <ChevronRight className="h-4 w-4 opacity-70" />
          )}
        </button>
      ))}
    </nav>
  );
}