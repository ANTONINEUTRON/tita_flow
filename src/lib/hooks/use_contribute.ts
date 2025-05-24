import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { AppConstants } from "../app_constants";
import { FundingFlow } from "../types/funding_flow";
import { getTitaFlowProgram } from "@project/anchor";
import { SolanaWallet } from "@civic/auth-web3";
import { BN } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { initSolTokenAccountInstruction } from "../utils/create_n_fund_ta";
import { Contribution } from "../types/contribution";
import AppUser from "../types/user";
import toast from "react-hot-toast";
import { useState } from "react";
import { FundingFlowResponse } from "../types/funding_flow.response";
import axios from "axios";
import { MonthlyAnalytics } from "../types/monthly_analytics";

export default function useContribute() {
    const connection = AppConstants.APP_CONNECTION;
    const program = getTitaFlowProgram({ connection } as any);
    const [contributions, setContributions] = useState<any[]>([]); //onchain contributions
    const [storeContributions, setStoreContributions] = useState<Contribution[]>([]); //offchain contributions record

    const getContributionsByFlow = async (flow: FundingFlowResponse) => {
        console.log("Flow: ", flow);
        const flowPDA = new PublicKey(flow.address!);

        const filter = [
            {
                memcmp: {
                    offset: 8,
                    bytes: flowPDA.toBase58()
                }
            }
        ];

        const contributions = await program.account.contribution.all(filter);
        return contributions;
    }

    const getContributionsByUser = async (userWallet: string) => {
        const userPubKey = new PublicKey(userWallet);

        const filter = [
            {
                memcmp: {
                    offset: 8,
                    bytes: userPubKey.toBase58()
                }
            }
        ];

        const contributions = await program.account.contribution.all(filter);
        setContributions(contributions)
    }

    const contributeTrx = async (
        amount: number,
        userAddress: string,
        flow: FundingFlow,
        solanaWallet: SolanaWallet
    ) => {
        const userPubKey = new PublicKey(userAddress);

        const selectedCurrency = AppConstants.SUPPORTEDCURRENCIES.find((currency) => currency.name === flow.currency)!;
        const selectedTokenMint: PublicKey = new PublicKey(selectedCurrency.address);
        const flowPDA = new PublicKey(flow.address!);
        const flowAccount = await program.account.flow.fetch(flowPDA);
        const flowTA = flowAccount.flowTa;

        // get contributor details
        const contributorPK = new PublicKey(userAddress);
        const contributorTokenAccount = await getAssociatedTokenAddress(
            selectedTokenMint,
            contributorPK,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        //
        const amountInBN = new BN(amount * Math.pow(10, selectedCurrency.decimals));

        const instructions: TransactionInstruction[] = [];

        if (flow.currency == "SOL") {
            const initSolTokenAccount = await initSolTokenAccountInstruction(
                contributorPK,
                amount
            );
            instructions.push(...initSolTokenAccount)
        }

        const [contributionPda] = await PublicKey.findProgramAddressSync(
            [
                AppConstants.TITA_CONTRIBUTION_SEED,
                flowPDA.toBuffer(),
                contributorPK.toBuffer(),
            ],
            program.programId
        );

        const instruction = await program.methods.contribute(
            amountInBN
        ).accountsPartial({
            contributor: contributorPK,
            flow: flowPDA,
            contribution: contributionPda,
            contributorTokenAccount: contributorTokenAccount,
            flowTokenAccount: flowTA,
            tokenMint: selectedTokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        }).instruction();

        const blockhash = await connection.getLatestBlockhash();
        const trx = new Transaction({
            ...blockhash,
            feePayer: userPubKey,
        });

        trx.add(...instructions, instruction)

        const signature = await solanaWallet.sendTransaction(trx, connection);

        await connection.confirmTransaction({ signature, ...blockhash });

        const trxAddress = contributionPda.toString();

        return { trxAddress, signature };
    }


    const saveToDB = async (contribution: Contribution) => {
        // save to DB
        const response = await fetch('/api/contribute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contribution),
        });

    }


    const contribute = async (
        amount: number,
        user: AppUser,
        flow: FundingFlow,
        solanaWallet: SolanaWallet,
    ) => {
        try {
            // Attempt to send transaction
            const { trxAddress, signature } = await contributeTrx(
                amount,
                user.wallet,
                flow,
                solanaWallet
            );

            // If successful, save the real data
            const contribution: Contribution = {
                signature: signature,
                pda: trxAddress,
                amount: amount,
                flow_id: flow.id!,
                contributor: user.wallet,
                currency: flow.currency,
                created_at: new Date().toISOString()
            };

            await saveToDB(contribution);

        } catch (error) {
            console.error("Transaction failed:", error);
            toast.error("Couldn't complete contribution. Please try again.");
        }
    }

    // Function to process contributions into monthly analytics data
    const getMonthlyAnalyticsData = async (userId: string): Promise<MonthlyAnalytics[]> =>  {
        try {
            const response = await axios.post('/api/user/flows/analytics', {
                userId: userId
            });

            return response.data as MonthlyAnalytics[];
        } catch (error) {
            console.error("Error processing contributions for analytics:", error);
        }
        return [];
    };


    return { 
        contributions, 
        contribute, 
        getContributionsByFlow, 
        getMonthlyAnalyticsData, 
        getContributionsByUser 
    }
}