'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { AppConstants } from '../app_constants';

export default function Provider({ children }: { children: React.ReactNode }) {
    return (  
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APPID!}
            config={{
                solanaClusters: [{ name: 'devnet', rpcUrl: AppConstants.APP_RPC_ENDPOINT }],
                loginMethods: ["email", "google"],
                appearance: { walletChainType: 'solana-only' },
            }}>
            {children}
        </PrivyProvider>
    );
}
