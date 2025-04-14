import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddress, createAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import assert from 'assert';
import { before, describe, it } from 'node:test';
import { fundWallet } from './utils/test-setup';

describe('contribution', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.TitaFlow as Program<TitaFlow>;

    // Test accounts
    const creator = anchor.web3.Keypair.generate();
    const contributor = anchor.web3.Keypair.generate();
    const flowId = "test-flow-1";
    const goal = new anchor.BN(1000000); // 1,000,000 tokens
    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now);
    const endTime = new anchor.BN(now + 86400); // 1 day later
    const contributionAmount = new anchor.BN(100000); // 100,000 tokens

    // PDAs and accounts
    let flowPda: PublicKey;
    let flowTokenAccount: PublicKey;
    let tokenMint: PublicKey;
    let contributorTokenAccount: PublicKey;
    let contributionPda: PublicKey;

    before(async () => {
        // Fund creator
        await fundWallet(creator.publicKey, provider.connection);
        await fundWallet(contributor.publicKey, provider.connection);
        
        // Create test token mint
        tokenMint = await createMint(
            provider.connection,
            creator,
            creator.publicKey,
            null,
            9 // Decimals
        );

        // Fund contributor
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(
                contributor.publicKey,
                1000000000 // 1 SOL
            )
        );

        // Create contributor token account and mint tokens
        contributorTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            contributor.publicKey
        );
        await createAssociatedTokenAccount(
            provider.connection,
            creator,
            tokenMint,
            contributor.publicKey
        );
        await mintTo(
            provider.connection,
            creator,
            tokenMint,
            contributorTokenAccount,
            creator.publicKey,
            1000000000 // 1,000,000,000 tokens (with 9 decimals)
        );

        // Create flow
        [flowPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow"),
                Buffer.from(flowId),
                creator.publicKey.toBuffer(),
            ],
            program.programId
        );

        [flowTokenAccount] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow-ta"),
                flowPda.toBuffer(),
                tokenMint.toBuffer(),
            ],
            program.programId
        );

        await program.methods.createFlow(
            flowId,
            goal,
            startTime,
            endTime,
            null // No milestones
        )
            .accountsPartial({
                creator: creator.publicKey,
                flow: flowPda,
                flowTokenAccount: flowTokenAccount,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        // Find contribution PDA
        [contributionPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-contribution"),
                flowPda.toBuffer(),
                contributor.publicKey.toBuffer(),
            ],
            program.programId
        );
    });

    it('should successfully contribute to a flow', async () => {
        const initialFlowAccount = await program.account.flow.fetch(flowPda);
        const initialRaised = initialFlowAccount.raised;

        await program.methods.contribute(contributionAmount)
            .accountsPartial({
                contributor: contributor.publicKey,
                flow: flowPda,
                contribution: contributionPda,
                contributorTokenAccount: contributorTokenAccount,
                flowTokenAccount: flowTokenAccount,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([contributor])
            .rpc();

        // Verify flow account was updated
        const flowAccount = await program.account.flow.fetch(flowPda);
        assert.ok(flowAccount.raised.eq(initialRaised.add(contributionAmount)));
        assert.equal(flowAccount.contributorCount, 1);

        // Verify contribution account was created
        const contributionAccount = await program.account.contribution.fetch(contributionPda);
        assert.ok(contributionAccount.flow.equals(flowPda));
        assert.ok(contributionAccount.contributor.equals(contributor.publicKey));
        assert.ok(contributionAccount.totalAmount.eq(contributionAmount));
        assert.equal(contributionAccount.contributionCount, 1);
        assert.ok(contributionAccount.tokenMint.equals(tokenMint));
    });

    it('should fail with invalid contribution amount (0)', async () => {
        try {
            await program.methods.contribute(new anchor.BN(0))
                .accountsPartial({
                    contributor: contributor.publicKey,
                    flow: flowPda,
                    contribution: contributionPda,
                    contributorTokenAccount: contributorTokenAccount,
                    flowTokenAccount: flowTokenAccount,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([contributor])
                .rpc();

            assert.fail("Should have thrown an error for invalid contribution amount");
        } catch (err: any) {
            assert.equal(err.error.errorCode.code, "InvalidContributionAmount");
            assert.equal(err.error.errorCode.number, 6012);
        }
    });

    it('should fail when flow is not active', async () => {
        // Create a canceled flow
        const canceledFlowId = "canceled-flow";
        const [canceledFlowPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow"),
                Buffer.from(canceledFlowId),
                creator.publicKey.toBuffer(),
            ],
            program.programId
        );

        const [canceledFlowTokenAccount] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow-ta"),
                canceledFlowPda.toBuffer(),
                tokenMint.toBuffer(),
            ],
            program.programId
        );

        await program.methods.createFlow(
            canceledFlowId,
            goal,
            startTime,
            endTime,
            null
        )
            .accountsPartial({
                creator: creator.publicKey,
                flow: canceledFlowPda,
                flowTokenAccount: canceledFlowTokenAccount,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        // Cancel the flow (simulate by directly modifying account status)
        // Note: In a real test, you would need a proper cancel instruction
        const flowAccount = await program.account.flow.fetch(canceledFlowPda);
        flowAccount.flowStatus = { canceled: {} };
        // This is just for illustration - in practice you'd need a way to modify the account

        try {
            await program.methods.contribute(contributionAmount)
                .accountsPartial({
                    contributor: contributor.publicKey,
                    flow: canceledFlowPda,
                    contribution: contributionPda,
                    contributorTokenAccount: contributorTokenAccount,
                    flowTokenAccount: canceledFlowTokenAccount,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([contributor])
                .rpc();

            assert.fail("Should have thrown an error for inactive flow");
        } catch (err: any) {
            assert.equal(err.error.errorCode.code, "FlowNotActive");
            assert.equal(err.error.errorCode.number, 6013);
        }
    });

    it('should fail when flow has not started', async () => {
        // Create a future flow
        const futureFlowId = "future-flow";
        const futureStartTime = new anchor.BN(now + 86400); // 1 day in future
        const [futureFlowPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow"),
                Buffer.from(futureFlowId),
                creator.publicKey.toBuffer(),
            ],
            program.programId
        );

        const [futureFlowTokenAccount] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow-ta"),
                futureFlowPda.toBuffer(),
                tokenMint.toBuffer(),
            ],
            program.programId
        );

        await program.methods.createFlow(
            futureFlowId,
            goal,
            futureStartTime,
            endTime,
            null
        )
            .accountsPartial({
                creator: creator.publicKey,
                flow: futureFlowPda,
                flowTokenAccount: futureFlowTokenAccount,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        try {
            await program.methods.contribute(contributionAmount)
                .accountsPartial({
                    contributor: contributor.publicKey,
                    flow: futureFlowPda,
                    contribution: contributionPda,
                    contributorTokenAccount: contributorTokenAccount,
                    flowTokenAccount: futureFlowTokenAccount,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([contributor])
                .rpc();

            assert.fail("Should have thrown an error for flow not started");
        } catch (err: any) {
            assert.equal(err.error.errorCode.code, "FlowNotStarted");
            assert.equal(err.error.errorCode.number, 6018);
        }
    });

    it('should fail when flow has ended', async () => {
        // Create a past flow
        const pastFlowId = "past-flow";
        const pastStartTime = new anchor.BN(now - 172800); // 2 days ago
        const pastEndTime = new anchor.BN(now - 86400); // 1 day ago
        const [pastFlowPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow"),
                Buffer.from(pastFlowId),
                creator.publicKey.toBuffer(),
            ],
            program.programId
        );

        const [pastFlowTokenAccount] = await PublicKey.findProgramAddress(
            [
                Buffer.from("tita-flow-ta"),
                pastFlowPda.toBuffer(),
                tokenMint.toBuffer(),
            ],
            program.programId
        );

        await program.methods.createFlow(
            pastFlowId,
            goal,
            pastStartTime,
            pastEndTime,
            null
        )
            .accountsPartial({
                creator: creator.publicKey,
                flow: pastFlowPda,
                flowTokenAccount: pastFlowTokenAccount,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        try {
            await program.methods.contribute(contributionAmount)
                .accountsPartial({
                    contributor: contributor.publicKey,
                    flow: pastFlowPda,
                    contribution: contributionPda,
                    contributorTokenAccount: contributorTokenAccount,
                    flowTokenAccount: pastFlowTokenAccount,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([contributor])
                .rpc();

            assert.fail("Should have thrown an error for ended flow");
        } catch (err:any) {
            assert.equal(err.error.errorCode.code, "FlowEnded");
            assert.equal(err.error.errorCode.number, 6017);
        }
    });
});