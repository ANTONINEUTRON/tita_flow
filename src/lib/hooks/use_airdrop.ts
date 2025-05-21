import { useState } from 'react';
import AppUser from '../types/user';
import { SupportCurrency } from '../types/supported_currencies';
import toast from 'react-hot-toast';

export function useAirdrop() {
    const [isLoading, setIsLoading] = useState(false);

    const requestDevnetToken = async (user: AppUser, currency: SupportCurrency) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/airdrop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenMint: currency.address, userAddress: user.wallet })
            });

            const result = await response.json();
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