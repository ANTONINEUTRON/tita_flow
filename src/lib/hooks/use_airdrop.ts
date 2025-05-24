import { useState } from 'react';
import AppUser from '../types/user';
import { SupportCurrency } from '../types/supported_currencies';
import toast from 'react-hot-toast';
import axios from 'axios';
import airdropWallet from '../utils/airdrop_wallet';

export function useAirdrop() {
    const [isLoading, setIsLoading] = useState(false);

    const requestDevnetToken = async (user: AppUser, currency: SupportCurrency) => {
        setIsLoading(true);
        try {
            if (currency.name === "SOL") {
                airdropWallet(user.wallet);
            } else {

                const response = await axios.post('/api/airdrop', {
                    tokenMint: currency.address,
                    userAddress: user.wallet
                });

                const result = response.data;
            }
            // toast.success('Request for '+currency.name+' sent successfully!');
        } catch (error) {
            console.error('Failed to request USDC:', error);
            toast.error("Request for airdrop failed")
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    };

    return { requestDevnetToken, isLoading };
}