import useProfile from "@/lib/hooks/use_profile";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    const {signUserOut,loading} = useProfile()
    
    return (
        <Button 
            variant="default" 
            className="w-full" 
            isLoading={loading}
            onClick={signUserOut}>
            <LogOut className="h-4 w-4" /> Sign out
        </Button>
    )
}