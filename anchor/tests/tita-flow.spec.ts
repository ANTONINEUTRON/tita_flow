import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import * as web3 from '@solana/web3.js';
import {
  createMint,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo
} from '@solana/spl-token';
import { describe, it, before } from 'node:test';
import assert from 'assert';
import { PublicKey } from '@solana/web3.js';
import { fundWallet } from './utils/test-setup';

// Constants
const TITA_FLOW_SEED = Buffer.from("tita-flow");
const TITA_CONTRIBUTION_SEED = Buffer.from("tita-contribution");
const TITA_FLOW_TA_SEED = Buffer.from("tita-flow-ta");

describe('tita_flow', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TitaFlow as Program<TitaFlow>;

  // Test accounts
  let creator: anchor.web3.Keypair;
  let contributor: anchor.web3.Keypair;
  const flowId = "test-flow-1";
  const goal = new anchor.BN(1000000); // 1,000,000 tokens
  const now = Math.floor(Date.now() / 1000);
  const startTime = new anchor.BN(now + 60);
  const endTime = new anchor.BN(now + 86400); // 1 day later
  const contributionAmount = new anchor.BN(100000); // 100,000 tokens

  // PDAs and accounts
  let flowPda: PublicKey;
  let milestoneFlowPda: PublicKey;
  let flowTokenAccount: PublicKey;
  let tokenMint: PublicKey;
  let contributorTokenAccount: PublicKey;
  let contributionPda: PublicKey;

  before(async () => {
    creator = anchor.web3.Keypair.generate();
    contributor = anchor.web3.Keypair.generate();
    await fundWallet(creator.publicKey, provider.connection);
    await fundWallet(contributor.publicKey, provider.connection);

    // Create a test token mint
    tokenMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6
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
      1000000000 // 1,000,000,000 tokens
    );
  });

  // Flow Creation Tests
  it('should initialize direct flow account', async () => {
    // Find the flow PDA
    [flowPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(flowId),
        creator.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Find the flow token account PDA
    [flowTokenAccount] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_TA_SEED,
        flowPda.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId
    );

    // Create the flow
    await program.methods.createFlow(
      flowId,
      goal,
      startTime,
      endTime,
      null // no milestones = direct flow
    ).accountsPartial({
      creator: creator.publicKey,
      flow: flowPda,
      flowTokenAccount: flowTokenAccount,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([creator])
      .rpc();

    // Fetch the created flow account
    const flowAccount = await program.account.flow.fetch(flowPda);

    // Verify flow account data
    assert.strictEqual(flowAccount.flowId, flowId);
    assert.ok(flowAccount.creator.equals(creator.publicKey));
    assert.ok(flowAccount.tokenMint.equals(tokenMint));
    assert.ok(flowAccount.goal.eq(goal));
    assert.ok(flowAccount.raised.eq(new anchor.BN(0)));
    assert.strictEqual(flowAccount.startDate?.toNumber(), startTime.toNumber());
    assert.strictEqual(flowAccount.endDate?.toNumber(), endTime.toNumber());
    assert.deepStrictEqual(flowAccount.flowStatus, { active: {} });
    assert.strictEqual(flowAccount.contributorCount, 0);

    // Find contribution PDA for later tests
    [contributionPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_CONTRIBUTION_SEED,
        flowPda.toBuffer(),
        contributor.publicKey.toBuffer(),
      ],
      program.programId
    );
    // console.log("Contributor pubkey:", contributionPda.toBase58());
    // console.log("flow pubkey:", flowPda.toBase58());
  });

  it('should initialize milestone flow account', async () => {
    let milestoneFlowId = "test-milestone-flow-1";
    // Find the flow PDA
    [milestoneFlowPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(milestoneFlowId),
        creator.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Find the flow token account PDA
    [flowTokenAccount] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_TA_SEED,
        milestoneFlowPda.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId
    );

    // Create the flow
    await program.methods.createFlow(
      milestoneFlowId,
      goal,
      startTime,
      endTime,
      [
        {
          id: 1,
          amount: new anchor.BN(500000), // 500,000 tokens
          deadline: new anchor.BN(now + 3600), // 1 hour later
          completed: false,
        },
        {
          id: 2,
          amount: new anchor.BN(500000), // 500,000 tokens
          deadline: new anchor.BN(now + 7200), // 2 hours later
          completed: false,
        },
      ] // milestones
    )
      .accountsPartial({
        creator: creator.publicKey,
        flow: milestoneFlowPda,
        flowTokenAccount: flowTokenAccount,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Fetch the created flow account
    const flowAccount = await program.account.flow.fetch(milestoneFlowPda);

    // Verify flow account data
    assert.strictEqual(flowAccount.flowId, milestoneFlowId);
    assert.ok(flowAccount.creator.equals(creator.publicKey));
    assert.ok(flowAccount.tokenMint.equals(tokenMint));
    assert.ok(flowAccount.goal.eq(goal));
    assert.ok(flowAccount.raised.eq(new anchor.BN(0)));
    assert.strictEqual(flowAccount.startDate?.toNumber(), startTime.toNumber());
    assert.strictEqual(flowAccount.endDate?.toNumber(), endTime.toNumber());
    assert.deepStrictEqual(flowAccount.flowStatus, { active: {} });
    assert.strictEqual(flowAccount.contributorCount, 0);
  });

  it('should fail with empty flow ID', async () => {
    try {
      const emptyFlowId = "";

      const [invalidFlowPda] = web3.PublicKey.findProgramAddressSync(
        [TITA_FLOW_SEED, Buffer.from(emptyFlowId), creator.publicKey.toBuffer()],
        program.programId
      );

      await program.methods.createFlow(
        emptyFlowId, // Empty flow ID
        goal,
        startTime,
        endTime,
        null // no milestones = direct flow
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
          flowTokenAccount: flowTokenAccount,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      assert.fail("Should have thrown an error for empty flow ID");
    } catch (err: any) {
      assert.strictEqual(err.error.errorCode.code, "EmptyFlowId");
      assert.strictEqual(err.error.errorCode.number, 6001);
    }
  });

  it('should fail with invalid goal amount (0)', async () => {
    const invalidFlowId = "invalid-goal-flow";

    const [invalidFlowPda] = web3.PublicKey.findProgramAddressSync(
      [TITA_FLOW_SEED, Buffer.from(invalidFlowId), creator.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods.createFlow(
        invalidFlowId,
        new anchor.BN(0), // Invalid goal
        startTime,
        endTime,
        null // no milestones = direct flow
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
          flowTokenAccount: flowTokenAccount,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      assert.fail("Should have thrown an error for invalid goal amount");
    } catch (err: any) {
      assert.strictEqual(err.error.errorCode.code, "InvalidGoalAmount");
      assert.strictEqual(err.error.errorCode.number, 6003);
    }
  });

  // Contribution Tests
  it('should successfully contribute to a flow', async () => {
    const initialFlowAccount = await program.account.flow.fetch(flowPda);
    const initialRaised = initialFlowAccount.raised;

    // console.log("Contributor2 pubkey:", contributionPda.toBase58());
    // console.log("flow2 pubkey:", flowPda.toBase58());
    await program.methods.contribute(contributionAmount)
      .accountsPartial({
        contributor: contributor.publicKey,
        flow: flowPda,
        contribution: contributionPda,
        contributorTokenAccount: contributorTokenAccount,
        flowTokenAccount: flowTokenAccount,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([contributor])
      .rpc();

    // Verify flow account was updated
    const flowAccount = await program.account.flow.fetch(flowPda);
    assert.ok(flowAccount.raised.eq(initialRaised.add(contributionAmount)));
    assert.strictEqual(flowAccount.contributorCount, 1);

    // Verify contribution account was created
    const contributionAccount = await program.account.contribution.fetch(contributionPda);
    assert.ok(contributionAccount.flow.equals(flowPda));
    assert.ok(contributionAccount.contributor.equals(contributor.publicKey));
    assert.ok(contributionAccount.totalAmount.eq(contributionAmount));
    assert.strictEqual(contributionAccount.contributionCount, 1);
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
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc();

      assert.fail("Should have thrown an error for invalid contribution amount");
    } catch (err: any) {
      assert.strictEqual(err.error.errorCode.code, "InvalidContributionAmount");
      assert.strictEqual(err.error.errorCode.number, 6012);
    }
  });
});