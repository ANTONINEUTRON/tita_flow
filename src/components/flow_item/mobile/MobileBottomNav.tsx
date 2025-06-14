import React from "react";
import { ArrowDownIcon, Coins, FileText, Loader, LogInIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlowType, NavItem } from "../../../lib/types/typesbbbb";

interface MobileBottomNavProps {
  mobileNavItems: NavItem[];
  activeView: string;
  isSignedIn: boolean;
  canContribute: boolean;
  isLoading: boolean;
  onNavigate: (view: string) => void;
  onContributeClicked: () => void;
}

export function MobileBottomNav({
  mobileNavItems,
  activeView,
  isSignedIn,
  canContribute,
  isLoading,
  onNavigate,
  onContributeClicked: onAction
}: MobileBottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 pb-safe">
      {/* Notch for the donate button */}
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
        <Button
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          onClick={onAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="">
              <Loader className="animate-spin h-6 w-6 text-white" />
            </div>
          ) : (
            <div>
                {
                  isSignedIn ? (
                    canContribute ? (
                      <div>
                        <Coins className="h-6 w-6" />
                        <span className="sr-only">Contribute</span>
                      </div>
                    ) : (
                      <div>
                        <ArrowDownIcon className="h-6 w-6" />
                        <span className="sr-only">Withdraw</span>
                      </div>
                    )
                  ) : (
                    <div>
                      <LogInIcon className="h-6 w-6" />
                      <span className="sr-only">Sign in to contribute</span>
                    </div>
                  )
                }
            </div>
          )}
        </Button>
      </div>

      {/* Bottom nav items */}
      <div className="flex justify-around items-center h-16">
        {mobileNavItems.map((item, index) => {
          // Create space in the middle for the donate button
          const isMiddle = mobileNavItems.length === 4 && index === 1;

          return (
            <React.Fragment key={item.href}>
              <button
                onClick={() => onNavigate(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center text-xs w-16 h-full",
                  activeView === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  activeView === item.href ? "text-primary" : "text-muted-foreground"
                )} />
                <span>{item.title}</span>
                {(item?.badge ?? 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute top-1 ml-4 text-[10px] h-4 min-w-4 flex items-center justify-center p-0 px-1"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>

              {/* Add a spacer in the middle for the donate button */}
              {isMiddle && <div className="w-16" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}