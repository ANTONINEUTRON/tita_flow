import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    
    return (
        <Button variant="default" className="w-full" onClick={() => {}}>
            <LogOut className="h-4 w-4" /> Sign out
        </Button>
    )
}