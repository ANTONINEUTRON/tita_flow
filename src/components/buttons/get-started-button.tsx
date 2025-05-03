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
    const { signIn, loading, userProfile } = useProfile()
    const [signinClicked, setSigninClicked] = useState(false);

    useEffect(() => {
        if(userProfile && signinClicked){
            router.push("/app/dashboard")
            toast.success("Welcome back!");
        }
    },[userProfile]);

    const onclick = () => {
        if(userProfile){
            router.push("/app/dashboard")
        } else {
            signIn();
            setSigninClicked(true);
        }
    }
    
    return (
        <Button 
            onClick={onclick} 
            variant={variant} 
            isLoading={loading}
            className={cn(
                "px-8 h-11 ",className
            )}>     
            {text}
        </Button>
    );
}