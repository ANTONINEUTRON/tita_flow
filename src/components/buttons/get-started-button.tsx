'use client'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useUser } from "@civic/auth-web3/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useProfile from "@/lib/hooks/use_profile";


interface GetStartedButtonProps {
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
    const {userProfile, signUserIn, loading} = useProfile()
    // const [isSigningIn, setIsSigningIn] = useState(false);

    // When user state changes and we were in signing in process, navigate
    // useEffect(() => {
    //     if (userProfile && !loading) {
    //         // setIsSigningIn(false);
    //         // router.push("/app/dashboard");
    //     }
    // }, [userProfile, loading]);

    const onclick = () => {
        // if (userProfile) {
        //     router.push("/app/dashboard")
        // } else {
            signUserIn()
        // }
    }

    return (
        <Button
            onClick={onclick}
            variant={variant}
            isLoading={loading}
            className={cn(
                "px-8 h-11 ", className
            )}>
            {text}
        </Button>
    );
}