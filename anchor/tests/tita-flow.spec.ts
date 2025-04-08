import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import * as web3 from '@solana/web3.js';
// import {
//   Keypair,
//   LAMPORTS_PER_SOL,
//   PublicKey,
//   SystemProgram,
// } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createAssociatedTokenAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { describe, it, before } from 'node:test';
import assert from 'assert';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';


// Constants
const TITA_FLOW_SEED = Buffer.from("tita-flow");
const TITA_VAULT_SEED = Buffer.from("tita-vault");


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
  let vaultPda: PublicKey;
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

  it('should initialize flow and vault accounts', async () => {
    // Find the flow PDA
    [flowPda] = await PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(flowId),
        creator.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Find the vault PDA
    [vaultPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("tita-vault"),
        flowPda.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId
    );

    // Create the flow
    await program.methods.createDirectFlow(
      flowId,
      goal,
      startTime,
      endTime
    )
      .accountsPartial({
        creator: creator.publicKey,
        flow: flowPda,
        vault: vaultPda,
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
    assert.ok(flowAccount.primaryVault.equals(vaultPda));

    // Fetch the created vault account
    const vaultAccount = await program.account.vault.fetch(vaultPda);

    // Verify vault account data
    assert.ok(vaultAccount.flow.equals(flowPda));
    assert.ok(vaultAccount.tokenMint.equals(tokenMint));
    assert.ok(vaultAccount.amount.eq(new anchor.BN(0)));
    assert.deepStrictEqual(vaultAccount.vaultType, { direct: {} });
    assert.strictEqual(vaultAccount.milestoneDeadline, null);
    assert.strictEqual(vaultAccount.milestoneCompleted, null);
    assert.strictEqual(vaultAccount.recipient, null);
    assert.strictEqual(vaultAccount.weight, null);
  });

  it('should fail with empty flow ID', async () => {
    try {
      const emptyFlowId = "";

      const [invalidFlowPda] = web3.PublicKey.findProgramAddressSync(
        [TITA_FLOW_SEED, Buffer.from(emptyFlowId), creator.publicKey.toBuffer()],
        program.programId
      );

      const [invalidVaultPda] = web3.PublicKey.findProgramAddressSync(
        [TITA_VAULT_SEED, invalidFlowPda.toBuffer(), tokenMint.toBuffer()],
        program.programId
      );

      await program.methods.createDirectFlow(
        emptyFlowId, // Empty flow ID
        goal,
        startTime,
        endTime
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
          vault: invalidVaultPda,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      assert.fail("Should have thrown an error for empty flow ID");
    } catch (err: any) {
      assert.strictEqual(err.error.errorCode.code, "EmptyFlowId");
      assert.strictEqual(err.error.errorCode.number, 6000);
    }
  });

  it('should fail with invalid goal amount (0)', async () => {
    const invalidFlowId = "invalid-goal-flow";

    const [invalidFlowPda] = web3.PublicKey.findProgramAddressSync(
      [TITA_FLOW_SEED, Buffer.from(invalidFlowId), creator.publicKey.toBuffer()],
      program.programId
    );

    const [invalidVaultPda] = web3.PublicKey.findProgramAddressSync(
      [TITA_VAULT_SEED, invalidFlowPda.toBuffer(), tokenMint.toBuffer()],
      program.programId
    );

    try {
      await program.methods.createDirectFlow(
        invalidFlowId,
        new anchor.BN(0), // Invalid goal
        startTime,
        endTime
      )
        .accountsPartial({
          creator: creator.publicKey,
          flow: invalidFlowPda,
          vault: invalidVaultPda,
          tokenMint: tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      assert.fail("Should have thrown an error for invalid goal amount");
    } catch (err: any) {
      assert.strictEqual(err.error.errorCode.code, "InvalidGoalAmount");
      assert.strictEqual(err.error.errorCode.number, 6002);
    }
  });

  // it('should fail with invalid timeframe (end before start)', async () => {
  //   try {
  //     await program.methods.createDirectFlow(
  //       "invalid-timeflow-flow",
  //       goal,
  //       endTime, // Start time is after end time
  //       startTime
  //     )
  //       .accountsPartial({
  //         creator: creator,
  //         flow: flowPda,
  //         vault: vaultPda,
  //         tokenMint: tokenMint,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .rpc();

  //     assert.fail("Should have thrown an error for invalid timeframe");
  //   } catch (err: any) {
  //     assert.strictEqual(err.error.errorCode.code, "InvalidTimeframe");
  //     assert.strictEqual(err.error.errorCode.number, 6004);
  //   }
  // });

  // it('should emit FlowCreatedEvent on successful creation', async () => {
  //   const newFlowId = "event-test-flow";
  //   const [newFlowPda] = await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from("tita-flow"),
  //       Buffer.from(newFlowId),
  //       creator.toBuffer(),
  //     ],
  //     program.programId
  //   );

  //   const [newVaultPda] = await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from("tita-vault"),
  //       newFlowPda.toBuffer(),
  //       tokenMint.toBuffer(),
  //     ],
  //     program.programId
  //   );

  //   const tx = await program.methods.createDirectFlow(
  //     newFlowId,
  //     goal,
  //     startTime,
  //     endTime
  //   )
  //     .accountsPartial({
  //       creator: creator,
  //       flow: newFlowPda,
  //       vault: newVaultPda,
  //       tokenMint: tokenMint,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .rpc();

  //   // Fetch the transaction and check for the event
  //   const txDetails = await provider.connection.getTransaction(tx, {
  //     commitment: "confirmed",
  //   });

  //   // const eventParser = new anchor.EventParser(program.programId, program.coder);
  //   // const events = eventParser.parseLogs(txDetails?.meta?.logMessages ?? []);

  //   // assert.strictEqual(events.length, 1);
  //   // const event = events[0];

  //   // assert.strictEqual(event.name, "FlowCreatedEvent");
  //   // assert.strictEqual(event.data.flowId, newFlowId);
  //   // assert.ok(event.data.creator.equals(creator));
  //   // assert.deepStrictEqual(event.data.flowType, { direct: {} });
  //   // assert.ok(event.data.goal.eq(goal));
  //   // assert.ok(event.data.timestamp.toNumber() > 0);
  // });

  // Helper function to create a test token mint

});