import { PublicKey } from "@solana/web3.js";
import { AppConstants } from "@/lib/app_constants";
import { NATIVE_MINT } from "@solana/spl-token";

export async function getAssetBalance(tokenMint: string, userPublicKey: PublicKey): Promise<number> {
    if (tokenMint === "SOL" || tokenMint == NATIVE_MINT.toString()) {
        // Fetch SOL balance directly
        const solBalanceLamports = await AppConstants.APP_CONNECTION.getBalance(userPublicKey);
        const solBalance = solBalanceLamports / 1_000_000_000; // Convert from lamports to SOL
        return parseFloat(solBalance.toFixed(4));
    } else {
        // Fetch SPL token balance for other tokens (e.g., USDC, USDT, etc.)
        const tokenAccounts = await AppConstants.APP_CONNECTION.getParsedTokenAccountsByOwner(
            userPublicKey,
            { mint: new PublicKey(tokenMint) }
        );

        if (tokenAccounts.value.length === 0) {
            return 0; // No balance
        }

        // Sum up balances from all token accounts for the given mint
        const balance = tokenAccounts.value.reduce((total, account) => {
            const accountData = account.account.data.parsed.info;
            const tokenAmount = parseFloat(accountData.tokenAmount.uiAmountString || "0");
            return total + tokenAmount;
        }, 0);

        return parseFloat(balance.toFixed(4));
    }
}