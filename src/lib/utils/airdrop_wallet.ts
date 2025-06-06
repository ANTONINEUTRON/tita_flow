import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { AppConstants } from "../app_constants";

export default async function airdropWallet(walletAddress: string){
    try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');//AppConstants.APP_CONNECTION;
        
        // Airdrop SOL
        const airdropSignature = await connection.requestAirdrop(
            new PublicKey(walletAddress),
            1 * LAMPORTS_PER_SOL // 1 SOL in lamports (1 SOL = 1,000,000,000 lamports)
        );

        // Wait for 2 seconds to allow the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Confirm the transaction after the delay
        const confirmation = await connection.confirmTransaction(airdropSignature, 'confirmed');

        console.log('Airdrop successful:', airdropSignature);
    } catch (error) {
        console.error("Error during airdrop:", error);
    }
}
