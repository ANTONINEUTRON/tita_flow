"use client"

import { useEffect, useRef, useState } from "react";
import AppUser from "../types/user";
import toast from "react-hot-toast";
import axios from "axios";
import { generateFromEmail } from "unique-username-generator";
import { useRouter } from "next/navigation";
import { v4 as uuidv4, } from 'uuid';
import airdropWallet from "../utils/airdrop_wallet";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";

export default function useProfile() {
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const userContext = useUser();
    const { address } = useWallet({ type: "solana" })
    const [isFetching, setIsFetching] = useState(false);
    const walletInstance = userHasWallet(userContext)
        ? userContext.solana.wallet
        : undefined;
        const countRef = useRef(0);

    useEffect(() => {
        if (userContext.authStatus === "authenticated" && userProfile == null) {
            // router.push("/app/dashboard");
            onLogin();
        }
    }, [userContext.user])

    const signUserIn = async () => {
        setLoading(true);
        try {
            await userContext.signIn();
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }
        setLoading(false);
    }

    const signUserOut = async () => {
        setLoading(true);

        try {
            userContext.signOut();

            setUserProfile(null);
            setLoading(false);
            setError(null);
            router.push("/")
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }

        setLoading(false);
    }

    const onLogin = async () => {
        setLoading(true);

        try {
                // Identify user email
                let email = userContext.user?.email;

                // fetch user record from db
                let userRecord: AppUser | null = await fetchProfileWithEmail(email!)

                if (userRecord) {
                    //// if it exists, set the user profile
                    setUserProfile(userRecord)
                } else {
                    //// if it does not exist, create a new user record
                    let appUser: AppUser = {
                        id: userContext.user?.id || uuidv4(),
                        email: email!,
                        wallet: "",
                        username: generateFromEmail(
                            email!,
                            3
                        ),
                        name: "",
                        profilePics: "",
                    }

                    setUserProfile(appUser)

                    saveUserProfile(appUser)
                }

        } catch (error) {
            console.log("An error occurred while fetching user profile " + error);
            setError("An error occurred while fetching user profile");
        }

        setLoading(false);
    }

    const fetchProfile = async (userId: string): Promise<AppUser | null> => {
        try {
            console.log("Fetching user profile with id", userId);
            console.log("Fetching user profile with id", userId);
            console.log("Fetching user profile with id", userId);
            // fetch user record using axios from api/user?userId=[userId]
            const response = await axios.get(`/api/user?userId=${userId}`);
            console.log("User profile fetched", response.data);
            console.log("User profile fetched", response.data);
            console.log("User profile fetched", response.data);
            return response.data as AppUser;
        } catch (error) {
            setError("An error occurred while fetching user profile");
            console.error(error);
        }

        return null
    }


    const fetchProfileWithEmail = async (userEmail: string): Promise<AppUser | null> => {
        try {
            // fetch user record using axios from api/user?userId=[userId]
            const response = await axios.get(`/api/user?userEmail=${userEmail}`);

            return response.data as AppUser;
        } catch (error) {
            setError("An error occurred while fetching user profile");
            console.error(error);
        }

        return null
    }

    const saveUserProfile = async (userProfile: AppUser) => {
        try {
            if (userProfile.wallet === "") {
                if (userContext.user && !userHasWallet(userContext)) {
                    await userContext.createWallet();
                }
                // const { address } = await user!.createWallet();
                const updatedProfile: AppUser = { ...userProfile, wallet: address! };
                setUserProfile(updatedProfile);
                userProfile = updatedProfile;

                // airdrop the wallet
                airdropWallet(address!);
            }


            // save through post request to api/user
            const response = await axios.post(
                `/api/user`,
                userProfile,
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                },
            );

        } catch (error) {
            setError("An error occurred while saving user profile");
            console.error("An error occurred while saving user " + error);
        }
    }

    const updateUserProfile = async (id: string, updatedUserProfileFields: { [key: string]: any }) => {
        try {
            // save through put request to api/user
            const response = await axios.put(
                `/api/user`,
                {
                    userId: id,
                    ...updatedUserProfileFields
                }
            );
        } catch (error) {
            setError("An error occurred while updating user profile");
            console.error("Occurred while updating user profile " + error);
        }
    }

    return { userProfile, loading, error, walletInstance, fetchProfile, updateUserProfile, signUserIn, signUserOut }
}