import { useUser } from "@civic/auth-web3/react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    const { signOut } = useUser();
    
    return (
        <Button variant="default" className="w-full" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
        </Button>
    )
}