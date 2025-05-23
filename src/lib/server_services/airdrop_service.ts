import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import { AppConstants } from '../app_constants';

export async function AirdropService(
    userWallet: string, 
    tokenMintAddr: string
) {
    const adminKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(process.env.WALLET_PK!))
    );
    
    const connection = AppConstants.APP_CONNECTION;

    // Devnet mint address
    const mint = new PublicKey(tokenMintAddr);
    
    // Get or create token accounts
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        adminKeypair,
        mint,
        adminKeypair.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        adminKeypair,
        mint,
        new PublicKey(userWallet)
    );

    // Amount to airdrop (e.g., 10 USDC with 6 decimals)
    const amount = 100 * 1000000;
    
    // Create and send transaction
    const transaction = new Transaction().add(
        createTransferInstruction(
            fromTokenAccount.address,
            toTokenAccount.address,
            adminKeypair.publicKey,
            amount
        )
    );

    const blockhash = await connection.getLatestBlockhash();

    const signature = await connection.sendTransaction(
        transaction,
        [adminKeypair]
    );

    await connection.confirmTransaction({signature, ...blockhash});
    return { success: true, signature };
}