import { Connection, PublicKey, SystemProgram, Transaction, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";
import { AppConstants } from "../app_constants";
import { SolanaWallet } from "@civic/auth-web3";

/**
 * Fetches the token account address for a specific mint tied to a user's wallet.
 * @param connection - Solana connection object
 * @param walletAddress - Public key of the user's wallet
 * @param mintAddress - Public key of the token mint
 * @returns Token account address or null if not found
 */
async function findTokenAccountAddress(
    connection: Connection,
    walletAddress: PublicKey,
    mintAddress: PublicKey
): Promise<PublicKey | null> {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
        programId: TOKEN_PROGRAM_ID,
    });

    for (const accountInfo of tokenAccounts.value) {
        console.log("Checking token account:", accountInfo.pubkey.toBase58());
        const accountData = accountInfo.account.data.parsed.info;
        if (accountData.mint === mintAddress.toBase58()) {
            return accountInfo.pubkey;
        }
    }

    return null; // Token account not found
}

/**
 * Withdraws funds from the wallet.
 * @param payer - Keypair of the payer (sender)
 * @param recipientAddress - Address of the recipient wallet
 * @param amount - Amount to transfer (in lamports for SOL or token decimals for SPL tokens)
 * @param tokenAccountAddress - Optional token account address for SPL token transfer
 * @returns Transaction signature
 */
export async function withdrawFromWallet(
    solanaWallet: SolanaWallet,
    payer: PublicKey,
    recipientAddress: string,
    amount: number,
    tokenName: string
): Promise<string> {
    const currency = AppConstants.SUPPORTEDCURRENCIES.find(c => c.name === tokenName);
    const mintAddress = currency!.address;
    console.log("Withdraw from wallet called with params:", {
        payer: payer.toBase58(),
        recipientAddress,
        amount,
        mintAddress,
    });
    const connection = AppConstants.APP_CONNECTION;
    const recipientPublicKey = new PublicKey(recipientAddress);

    if (tokenName !== "SOL" ) {
        // Get the mint public key
        const mintPublicKey = new PublicKey(mintAddress);
        
        // Find the token account address for the sender
        const sourceTokenAccount = await findTokenAccountAddress(connection, payer, mintPublicKey);
        if (!sourceTokenAccount) {
            throw new Error(`Token account for mint ${mintAddress} not found in your wallet`);
        }
        
        // Find or create the Associated Token Account for the recipient
        const destinationTokenAccount = await getAssociatedTokenAddress(
            mintPublicKey,
            recipientPublicKey
        );
        
        // Check if the recipient's token account exists
        const destinationAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
        
        // Create transaction
        const blockhash = await connection.getLatestBlockhash();
        const transaction = new Transaction({
            ...blockhash,
            feePayer: payer,
        });
        
        // If destination token account doesn't exist, create it first
        if (!destinationAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    payer, // Payer
                    destinationTokenAccount, // Associated Token Account address
                    recipientPublicKey, // Owner
                    mintPublicKey // Mint
                )
            );
        }
        
        // Add transfer instruction
        transaction.add(
            createTransferInstruction(
                sourceTokenAccount, // Source token account
                destinationTokenAccount, // Destination token account (not wallet address)
                payer, // Owner of the source account
                amount * Math.pow(10, currency?.decimals!) // Amount
            )
        );
        
        // Send and confirm transaction
        const signature = await solanaWallet.sendTransaction(transaction, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    } else {
        // SOL transfer using System Program
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: recipientPublicKey,
            lamports: amount * Math.pow(10, currency?.decimals!), // Amount in lamports
        });

        const blockhash = await connection.getLatestBlockhash();
        const trx = new Transaction({
            ...blockhash,
            feePayer: payer,
        }).add(transferInstruction);

        const signature = await solanaWallet.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    }
}