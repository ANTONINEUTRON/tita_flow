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
import { SupportCurrency } from "../types/supported_currencies";
import { AppConstants } from "../app_constants";
import { getAssetBalance } from "../utils/get_asset_balance";
import { PublicKey } from "@solana/web3.js";
import { set } from "@coral-xyz/anchor/dist/cjs/utils/features";
import { useAirdrop } from "./use_airdrop";


export default function useProfile() {
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { address,  } = useWallet({ type: "solana" })
    const userContext = useUser();
    const walletInstance = userHasWallet(userContext)
        ? userContext.solana.wallet
        : undefined;
    const loadingRef = useRef(false);
    const [supportedCurrenciesBalances, setSCurrenciesBalances] = useState<number[]>([]);
    const [loadingSupportedCurrencies, setLoadingSupportedCurrencies] = useState(false);
    const { requestDevnetToken } = useAirdrop();

    useEffect(() => {
        // console.log("User Profile: ", userContext.user);
        if (userContext.user && !userProfile) {
            // router.push("/app/dashboard");
            if (!loadingRef.current) {
                loadingRef.current = true;
                onLogin()
            }
        }
    }, [userContext.user])

    useEffect(() => {
        if(userProfile?.wallet && supportedCurrenciesBalances.length === 0) {
            // fetch user balance
            fetchUserBalance();
        }
    },[userProfile?.wallet])

    const signUserIn = async () => {
        setLoading(true);
        try {
            await userContext.signIn();
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }
        // setLoading(false);
    }

    const signUserOut = async () => {
        setLoading(true);

        try {
            userContext.signOut();

            router.push("/")
            setUserProfile(null);
            setError(null);
        } catch (e) {
            console.log(e);
            toast.error("An error occurred during sign-in");
        }

        setLoading(false);
    }

    const onLogin = async () => {
        try {
            // Identify user email
            let email = userContext.user?.email;

            // fetch user record from db
            let userRecord: AppUser | null = await fetchProfileWithEmail(email!)

            if (userRecord) {
                //// if it exists, set the user profile
                setUserProfile(userRecord)

                if (!userRecord.profile_pics && userContext.user?.picture) {
                    // update the profile picture
                    updateUserProfile(userRecord.id, { profile_pics: userContext.user?.picture })
                }
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
                    profile_pics: userContext.user?.picture,
                }

                setUserProfile(appUser)

                saveUserProfile(appUser)
            }

        } catch (error) {
            console.log("An error occurred while fetching user profile " + error);
            setError("An error occurred while fetching user profile");
        }

        loadingRef.current = false;
        setLoading(false);
    }

    //If index is not specified, fetch all balances
    const fetchUserBalance = async (indexToFetch?: number) => {
        setLoadingSupportedCurrencies(true);
        try {
            if (indexToFetch) {
                console.log("Fetching balance for index: ", indexToFetch);
                // fetch
                const balance = await getAssetBalance(
                    AppConstants.SUPPORTEDCURRENCIES[indexToFetch].address,
                    new PublicKey(userProfile?.wallet!),
                )

                const updatedBalances = [...supportedCurrenciesBalances!];
                updatedBalances[indexToFetch] = balance;
                console.log("Updated Balances: ", updatedBalances);
                setSCurrenciesBalances(updatedBalances);
            } else {
                console.log("Fetching all balances");
                // fetch all balances
                const balances = await Promise.all(
                    AppConstants.SUPPORTEDCURRENCIES.map(async (currency, index) => {
                        const balance = await getAssetBalance(
                            currency.address,
                            new PublicKey(userProfile?.wallet!),
                        )
                        return balance;
                    })
                );
                console.log("Balances: ", balances);
                setSCurrenciesBalances(balances);
            }
        } catch (error) {
            console.error("An error occurred while fetching user balance", error);
            setError("An error occurred while fetching user balance");
        } finally {
            setLoadingSupportedCurrencies(false);
        }
    }

    const fetchProfile = async (userId: string): Promise<AppUser | null> => {
        try {
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
                if (userContext.user && !userHasWallet(userContext)) {
                    await userContext.createWallet();
                }
                // const { address } = await user!.createWallet();
                const updatedProfile: AppUser = { ...userProfile, wallet: address! };
                setUserProfile(updatedProfile);
                userProfile = updatedProfile;

                toast.success("Wallet created successfully");
                toast.success("Airdropping tokens to wallet");
                
                await requestDevnetToken(userProfile, AppConstants.SUPPORTEDCURRENCIES[1]);
                await requestDevnetToken(userProfile, AppConstants.SUPPORTEDCURRENCIES[2]);
                // airdrop the wallet
                await airdropWallet(userProfile.wallet);

                toast.success("Airdrop completed successfully");
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

    return { 
        userProfile, 
        loading, 
        error, 
        walletInstance, 
        supportedCurrenciesBalances, 
        loadingSupportedCurrencies, 
        fetchUserBalance,
        fetchProfile, 
        updateUserProfile, 
        signUserIn, 
        signUserOut 
    }
}