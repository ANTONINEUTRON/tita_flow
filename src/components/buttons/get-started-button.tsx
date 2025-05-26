'use client'
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useUser } from "@civic/auth-web3/react";
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
    const { user, signIn } = useUser();
    const { userProfile, signUserIn, loading } = useProfile()
    const [isSigningIn, setIsSigningIn] = useState(false);

    // When user state from CIVIC changes and email found, just navigate
    useEffect(() => {
        if (user?.email && isSigningIn) {
            // setIsSigningIn(false);
            router.push("/app/dashboard");
        }
    }, [user]);

    const onclick = () => {
        // window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
        if (userProfile || user?.email) {
            router.push("/app/dashboard")
        } else {
            setIsSigningIn(true);
            signUserIn()
        }
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