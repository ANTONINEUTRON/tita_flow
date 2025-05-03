"use client"
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useProfile from "@/lib/hooks/use_profile";
import { usePrivy } from "@privy-io/react-auth";

interface AuthGuardProps{
    children: ReactNode;
}

export default function AuthGuard({ children }:AuthGuardProps){
    const router = useRouter();
    const { userProfile, loading } = useProfile();
    const [verified, setVerified] = useState(false);
    const {user, } = usePrivy()

    useEffect(() => {
        console.log("Loading: ", loading);
        console.log("User Profile: ", userProfile);
        console.log("User: ", user);
        if (!loading) {
            if (!userProfile) {
                toast("Sign in to continue");
                router.push('/'); // Redirect to /app/ if not authenticated
            } else {
                setVerified(true);
            }
        }
    }, [ loading]);

    if (loading || !verified) {
        return null; // Show nothing while checking auth
    }

    return <>{children}</>; 
}