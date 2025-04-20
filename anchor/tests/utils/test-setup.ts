import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export const fundWallet = async (pubKey: PublicKey, connection: Connection) => {
    const signature = await connection.requestAirdrop(
        pubKey,
        10 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
        {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature
        },
        "confirmed"
    );
}