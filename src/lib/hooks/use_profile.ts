"use client"

import { useEffect, useState } from "react";
import AppUser from "../types/user";
import toast from "react-hot-toast";
import axios from "axios";
import { generateFromEmail } from "unique-username-generator";
import { useRouter } from "next/navigation";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { v4 as uuidv4, } from 'uuid';
import airdropWallet from "../utils/airdrop_wallet";

export default function useProfile() {
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { ready, authenticated, login, logout, user, } = usePrivy();
    const { createWallet } = useSolanaWallets();

    useEffect(() => {
        onLogin();
    }, [authenticated])

    const signIn = async () => {
        setLoading(true);
        try {
            login();
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }
        setLoading(false);
    }

    const signOut = async () => {
        setLoading(true);

        try {
            logout();

            setUserProfile(null);
            setLoading(false);
            setError(null);
            router.push("/app")
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }

        setLoading(false);
    }

    const onLogin = async () => {
        setLoading(true);

        try {
            if (authenticated && userProfile == null) {
                // Identify user email
                let email = user?.email?.address;
                if (!email) {
                    email = user?.google?.email;
                }

                // fetch user record from db
                let userRecord: AppUser | null = await fetchProfileWithEmail(email!)

                if (userRecord) {
                    //// if it exists, set the user profile
                    setUserProfile(userRecord)
                } else {
                    //// if it does not exist, create a new user record
                    let appUser: AppUser = {
                        id: uuidv4(),
                        email: email!,
                        wallet: "",
                        username: generateFromEmail(
                            email!,
                            3
                        ),
                        firstname: "",
                        lastname: "",
                    }

                    setUserProfile(appUser)

                    saveUserProfile(appUser)
                }
            } else {
                // signOut()
            }

        } catch (error) {
            console.log("An error occurred while fetching user profile " + error);
            setError("An error occurred while fetching user profile");
        }

        setLoading(false);
    }

    const fetchProfile = async (userId: string): Promise<AppUser | null> => {
        try {
            // fetch user record using axios from api/user?userId=[userId]
            const response = await axios.get(`/api/user?userId=${userId}`);

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
                const { address } = await createWallet();
                const updatedProfile = { ...userProfile, wallet: address };
                setUserProfile(updatedProfile);
                userProfile = updatedProfile;

                // airdrop the wallet
                airdropWallet(address);
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
                    id: id,
                    ...updatedUserProfileFields
                }
            );
        } catch (error) {
            setError("An error occurred while updating user profile");
            console.error("Occurred while updating user profile " + error);
        }
    }

    return { userProfile, loading, error, updateUserProfile, signIn, signOut, ready }
}