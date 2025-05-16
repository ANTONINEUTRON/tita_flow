import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { AppConstants } from "../app_constants";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";


const connection = AppConstants.APP_CONNECTION;

/**
 * A utility function to create a token account if it doesn't exist for devnet testing only
 * Since on mainnet, the token account should already exist
     * Creates token account instruction if needed
     * @param owner The public key of the token account owner
     * @param mint The token mint address
     * @returns Instructions to create token account if needed, or empty array if already exists
     */
export const initSolTokenAccountInstruction = async (
    feePayer: PublicKey,
    amountToFund: number,
): Promise<TransactionInstruction[]> => {
    const instructions: TransactionInstruction[] = [];

    try {
        // Get the address of the associated token account
        const tokenAccount = await getAssociatedTokenAddress(
            NATIVE_MINT, 
            feePayer,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Check if the account exists
        const accountInfo = await connection.getAccountInfo(tokenAccount);
        console.log("mint",)
        // If account doesn't exist, create instruction to create it
        if (!accountInfo) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    feePayer, 
                    tokenAccount,
                    feePayer,
                    NATIVE_MINT,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                )
            );
            console.log(`Creating token account instruction for ${feePayer.toString()}`);
            console.log("Token account does not exist, creating new one:", tokenAccount.toString());
            instructions.push(
                SystemProgram.transfer({
                    fromPubkey: feePayer,
                    toPubkey: tokenAccount,
                    lamports: amountToFund,
                })
            )
        }

        return instructions;
    } catch (error) {
        console.error("Error checking token account:", error);
        throw error;
    }
};