'use client'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useProfile from "@/lib/hooks/use_profile";


interface GetStartedButtonProps{
    text?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
    className?: string;
}


export default function GetStartedButton({
    text = "Get Started",
    variant = "default",
    className,
}: GetStartedButtonProps) {
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const { signIn, loading, ready } = useProfile()
    
    // When user state changes and we were in signing in process, navigate
    // useEffect(() => {
    //     if (user && isSigningIn) {
    //         setIsSigningIn(false);
    //         router.push("/app/dashboard");
    //     }
    // }, [user, isSigningIn, router]);

    const onclick = () => {
        // if(user){
        //     router.push("/app/dashboard")
        // } else {
        //     setIsSigningIn(true);
        //     signIn()
        //         .catch((error) => {
        //             console.error("Error signing in:", error);
        //             setIsSigningIn(false);
        //             toast.error("Error signing in. Please try again."); 
        //         });
        // }
    }
    
    return (
        <Button 
            onClick={onclick} 
            variant={variant} 
            className={cn(
                "px-8 h-11 ",className
            )}>     
            {text}
        </Button>
    );
}