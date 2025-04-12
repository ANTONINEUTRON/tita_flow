import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import * as web3 from '@solana/web3.js';
import {
  createMint,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { describe, it, before } from 'node:test';
import assert from 'assert';
import { PublicKey } from '@solana/web3.js';


// Constants
const TITA_FLOW_SEED = Buffer.from("tita-flow");

describe('tita_flow', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TitaFlow as Program<TitaFlow>;

  // Test accounts
  let creator: anchor.web3.Keypair;
  const flowId = "test-flow-1";
  const goal = new anchor.BN(1000000); // 1,000,000 tokens
  const now = Math.floor(Date.now() / 1000);
  const startTime = new anchor.BN(now + 60);
  const endTime = new anchor.BN(now + 86400); // 1 day later

  // PDAs
  let flowPda: PublicKey;
  let tokenMint: PublicKey;

  const fundWallet = async (pubKey: PublicKey) => {
    const signature = await provider.connection.requestAirdrop(
      pubKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature
      },
      "confirmed"
    );
  }


  before(async () => {
    creator = anchor.web3.Keypair.generate();
    await fundWallet(creator.publicKey);
    // Create a test token mint
    tokenMint = await createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6
    );
  });

  it('should initialize direct flow  account', async () => {
    // Find the flow PDA
    [flowPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(flowId),
        creator.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Create the flow
    await program.methods.createFlow(
      flowId,
      goal,
      startTime,
      endTime,
      null // no milestones = direct flow=
    ).accountsPartial({
        creator: creator.publicKey,
        flow: flowPda,
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
  });

  it('should initialize milestone flow account', async () => {
    let milestoneFlowId = "test-milestone-flow-1";
    // Find the flow PDA
    [flowPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(milestoneFlowId),
        creator.publicKey.toBuffer(),
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
        flow: flowPda,
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Fetch the created flow account
    const flowAccount = await program.account.flow.fetch(flowPda);

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
        null // no milestones = direct flow=
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
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
        null // no milestones = direct flow=
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
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
});