'use client'

import { AppConstants } from "@/lib/app_constants";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs"
import {
    ConnectionProvider,
    WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ConnectionProvider endpoint={AppConstants.APP_RPC_ENDPOINT}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <CivicAuthProvider>
                        {children}
                    </CivicAuthProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}