import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { AppConstants } from "../app_constants";

export default async function airdropWallet(walletAddress: string){
    try {
        // Step 1: Connect to the Solana Devnet
        const connection = AppConstants.APP_CONNECTION;
        
        // Airdrop SOL
        const airdropSignature = await connection.requestAirdrop(
            new PublicKey(walletAddress),
            5 * LAMPORTS_PER_SOL // 1 SOL in lamports (1 SOL = 1,000,000,000 lamports)
        );
    } catch (error) {
        console.error("Error during airdrop:", error);
    }
}