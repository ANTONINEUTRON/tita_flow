"use client"
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useProfile from "@/lib/hooks/use_profile";

interface AuthGuardProps{
    children: ReactNode;
}

export default function AuthGuard({ children }:AuthGuardProps){
    const router = useRouter();
    const { userProfile, loading } = useProfile();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!userProfile) {
                toast("Sign in to continue");
                router.push('/app/'); // Redirect to /app/ if not authenticated
            } else {
                setVerified(true);
            }
        }
    }, [userProfile, loading, router]);

    if (loading || !verified) {
        return null; // Show nothing while checking auth
    }

    return <>{children}</>; 
}