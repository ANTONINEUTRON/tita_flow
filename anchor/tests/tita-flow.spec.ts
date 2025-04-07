import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import * as web3 from '@solana/web3.js';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createAssociatedTokenAccount
} from '@solana/spl-token';
import { describe, it } from 'node:test';
import assert from 'assert';
import BN from 'bn.js';

// Constants
const TITA_FLOW_SEED = Buffer.from("tita-flow");
const TITA_VAULT_SEED = Buffer.from("tita-vault");

describe('tita-flow', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TitaFlow as Program<TitaFlow>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test state
  let tokenMint: PublicKey;
  let flowId: string;
  let flowPda: PublicKey;
  let vaultPda: PublicKey;

  // Setup helper: Create token mint
  const setupTokenMint = async (): Promise<PublicKey> => {
    // Create new token mint
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = null;
    const decimals = 6;

    // Create a mint
    const mintKeypair = Keypair.generate();
    const tokenMint = mintKeypair.publicKey;

    // Fund the mint account creator
    const lamports = await provider.connection.getMinimumBalanceForRentExemption(
      82 // Size of mint account
    );
    
    const createAccountTx = new web3.Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tokenMint,
        space: 82,
        lamports,
        programId: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
    );

    // Initialize the mint
    const initMintTx = new web3.Transaction().add(
      anchor.utils.token.createInitializeMintInstruction(
        tokenMint,
        decimals,
        mintAuthority,
        freezeAuthority,
        anchor.utils.token.TOKEN_PROGRAM_ID
      )
    );

    // Execute both transactions
    await provider.sendAndConfirm(createAccountTx, [mintKeypair]);
    await provider.sendAndConfirm(initMintTx);

    return tokenMint;
  };

  // Setup helper: Find PDAs
  const findPdas = (flowId: string, creator: PublicKey, tokenMint: PublicKey): [PublicKey, PublicKey] => {
    // Find flow PDA
    const [flowPda] = web3.PublicKey.findProgramAddressSync(
      [
        TITA_FLOW_SEED,
        Buffer.from(flowId),
        creator.toBuffer()
      ],
      program.programId
    );

    // Find vault PDA
    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [
        TITA_VAULT_SEED,
        flowPda.toBuffer(),
        tokenMint.toBuffer()
      ],
      program.programId
    );

    return [flowPda, vaultPda];
  };

  // Before all tests, set up the token mint
  before(async () => {
    tokenMint = await setupTokenMint();
    flowId = "test-flow-" + Math.floor(Math.random() * 1000000);
    [flowPda, vaultPda] = findPdas(flowId, wallet.publicKey, tokenMint);
  });

  describe('Direct Flow Creation', () => {
    it('should create a direct flow successfully', async () => {
      const goal = new BN(1_000_000_000); // 1000 tokens (assuming 6 decimals)
      const now = Math.floor(Date.now() / 1000);
      const startTime = null; // Start now
      const endTime = new BN(now + 30 * 24 * 60 * 60); // 30 days from now

      // Create the direct flow
      await program.methods
        .createDirectFlow(
          flowId,
          goal,
          startTime,
          endTime
        )
        .accounts({
          creator: wallet.publicKey,
          flow: flowPda,
          vault: vaultPda,
          tokenMint,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Fetch the flow account to verify it was created correctly
      const flowAccount = await program.account.flow.fetch(flowPda);

      // Verify flow data
      assert.strictEqual(flowAccount.flowId, flowId, "Flow ID mismatch");
      assert.strictEqual(
        flowAccount.creator.toString(),
        wallet.publicKey.toString(),
        "Creator mismatch"
      );
      assert.strictEqual(
        flowAccount.tokenMint.toString(),
        tokenMint.toString(),
        "Token mint mismatch"
      );
      assert.strictEqual(
        flowAccount.goal.toString(),
        goal.toString(),
        "Goal amount mismatch"
      );
      assert.strictEqual(
        flowAccount.raised.toString(),
        "0",
        "Initial raised amount should be 0"
      );
      assert.strictEqual(
        flowAccount.endDate.toString(),
        endTime.toString(),
        "End date mismatch"
      );
      assert.strictEqual(
        flowAccount.flowStatus.active !== undefined,
        true,
        "Flow status should be Active"
      );
      assert.strictEqual(
        flowAccount.contributorCount,
        0,
        "Initial contributor count should be 0"
      );
      assert.strictEqual(
        flowAccount.primaryVault.toString(),
        vaultPda.toString(),
        "Primary vault mismatch"
      );

      // Fetch the vault account to verify it was created correctly
      const vaultAccount = await program.account.vault.fetch(vaultPda);

      // Verify vault data
      assert.strictEqual(
        vaultAccount.flow.toString(),
        flowPda.toString(),
        "Vault flow reference mismatch"
      );
      assert.strictEqual(
        vaultAccount.tokenMint.toString(),
        tokenMint.toString(),
        "Vault token mint mismatch"
      );
      assert.strictEqual(
        vaultAccount.amount.toString(),
        "0",
        "Initial vault amount should be 0"
      );
      assert.strictEqual(
        vaultAccount.vaultType.direct !== undefined,
        true,
        "Vault type should be Direct"
      );
      assert.strictEqual(
        vaultAccount.milestoneDeadline,
        null,
        "Direct flow vault should not have milestone deadline"
      );
      assert.strictEqual(
        vaultAccount.milestoneCompleted,
        null,
        "Direct flow vault should not have milestone completion status"
      );
      assert.strictEqual(
        vaultAccount.recipient,
        null,
        "Direct flow vault should not have recipient"
      );
      assert.strictEqual(
        vaultAccount.weight,
        null,
        "Direct flow vault should not have weight"
      );
    });

    it('should reject flow creation with empty flow ID', async () => {
      const emptyFlowId = "";
      const goal = new BN(1_000_000_000);
      const now = Math.floor(Date.now() / 1000);
      const startTime = null;
      const endTime = new BN(now + 30 * 24 * 60 * 60);

      // Find PDAs for this flow
      const [invalidFlowPda, invalidVaultPda] = findPdas(
        emptyFlowId,
        wallet.publicKey,
        tokenMint
      );

      try {
        await program.methods
          .createDirectFlow(emptyFlowId, goal, startTime, endTime)
          .accounts({
            creator: wallet.publicKey,
            flow: invalidFlowPda,
            vault: invalidVaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        // If we reach here, the test failed
        assert.fail("Creating flow with empty ID should fail");
      } catch (error) {
        // Verify it's the expected error
        assert.ok(
          error.toString().includes("EmptyFlowId"),
          "Expected EmptyFlowId error"
        );
      }
    });

    it('should reject flow creation with zero goal amount', async () => {
      const zeroGoalFlowId = "zero-goal-" + Math.floor(Math.random() * 1000000);
      const goal = new BN(0);
      const now = Math.floor(Date.now() / 1000);
      const startTime = null;
      const endTime = new BN(now + 30 * 24 * 60 * 60);

      // Find PDAs for this flow
      const [invalidFlowPda, invalidVaultPda] = findPdas(
        zeroGoalFlowId,
        wallet.publicKey,
        tokenMint
      );

      try {
        await program.methods
          .createDirectFlow(zeroGoalFlowId, goal, startTime, endTime)
          .accounts({
            creator: wallet.publicKey,
            flow: invalidFlowPda,
            vault: invalidVaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        // If we reach here, the test failed
        assert.fail("Creating flow with zero goal should fail");
      } catch (error) {
        // Verify it's the expected error
        assert.ok(
          error.toString().includes("InvalidGoalAmount"),
          "Expected InvalidGoalAmount error"
        );
      }
    });

    it('should reject flow creation with end time in the past', async () => {
      const pastEndFlowId = "past-end-" + Math.floor(Math.random() * 1000000);
      const goal = new BN(1_000_000_000);
      const now = Math.floor(Date.now() / 1000);
      const startTime = null;
      const endTime = new BN(now - 86400); // 1 day ago

      // Find PDAs for this flow
      const [invalidFlowPda, invalidVaultPda] = findPdas(
        pastEndFlowId,
        wallet.publicKey,
        tokenMint
      );

      try {
        await program.methods
          .createDirectFlow(pastEndFlowId, goal, startTime, endTime)
          .accounts({
            creator: wallet.publicKey,
            flow: invalidFlowPda,
            vault: invalidVaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        // If we reach here, the test failed
        assert.fail("Creating flow with end time in the past should fail");
      } catch (error) {
        // Verify it's the expected error
        assert.ok(
          error.toString().includes("InvalidTimeframe"),
          "Expected InvalidTimeframe error"
        );
      }
    });

    it('should reject flow creation with end time before start time', async () => {
      const invalidTimeframeId = "invalid-time-" + Math.floor(Math.random() * 1000000);
      const goal = new BN(1_000_000_000);
      const now = Math.floor(Date.now() / 1000);
      const startTime = new BN(now + 86400 * 2); // 2 days from now
      const endTime = new BN(now + 86400); // 1 day from now (before start)

      // Find PDAs for this flow
      const [invalidFlowPda, invalidVaultPda] = findPdas(
        invalidTimeframeId,
        wallet.publicKey,
        tokenMint
      );

      try {
        await program.methods
          .createDirectFlow(invalidTimeframeId, goal, startTime, endTime)
          .accounts({
            creator: wallet.publicKey,
            flow: invalidFlowPda,
            vault: invalidVaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        // If we reach here, the test failed
        assert.fail("Creating flow with end time before start time should fail");
      } catch (error) {
        // Verify it's the expected error
        assert.ok(
          error.toString().includes("InvalidTimeframe"),
          "Expected InvalidTimeframe error"
        );
      }
    });

    it('should reject creating a flow with an ID that is too long', async () => {
      const tooLongFlowId = "a".repeat(33); // 33 chars (over 32 limit)
      const goal = new BN(1_000_000_000);
      const now = Math.floor(Date.now() / 1000);
      const startTime = null;
      const endTime = new BN(now + 30 * 24 * 60 * 60);

      // Find PDAs for this flow
      const [invalidFlowPda, invalidVaultPda] = findPdas(
        tooLongFlowId,
        wallet.publicKey,
        tokenMint
      );

      try {
        await program.methods
          .createDirectFlow(tooLongFlowId, goal, startTime, endTime)
          .accounts({
            creator: wallet.publicKey,
            flow: invalidFlowPda,
            vault: invalidVaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        // If we reach here, the test failed
        assert.fail("Creating flow with too long ID should fail");
      } catch (error) {
        // Verify it's the expected error
        assert.ok(
          error.toString().includes("FlowIdTooLong"),
          "Expected FlowIdTooLong error"
        );
      }
    });
  });

  describe('Flow Account Structure', () => {
    it('should have the correct account structure', async () => {
      // Fetch the flow account that was created in the first test
      const flowAccount = await program.account.flow.fetch(flowPda);
      
      // Check the account structure matches the IDL
      assert.ok(flowAccount.flowId !== undefined, "Missing flowId");
      assert.ok(flowAccount.creator !== undefined, "Missing creator");
      assert.ok(flowAccount.tokenMint !== undefined, "Missing tokenMint");
      assert.ok(flowAccount.goal !== undefined, "Missing goal");
      assert.ok(flowAccount.raised !== undefined, "Missing raised");
      assert.ok(flowAccount.startDate !== undefined, "Missing startDate");
      assert.ok(flowAccount.endDate !== undefined, "Missing endDate");
      assert.ok(flowAccount.flowStatus !== undefined, "Missing flowStatus");
      assert.ok(flowAccount.contributorCount !== undefined, "Missing contributorCount");
      assert.ok(flowAccount.primaryVault !== undefined, "Missing primaryVault");
      assert.ok(flowAccount.bump !== undefined, "Missing bump");
    });
    
    it('should have the correct vault structure', async () => {
      // Fetch the vault account that was created in the first test
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      
      // Check the account structure matches the IDL
      assert.ok(vaultAccount.flow !== undefined, "Missing flow reference");
      assert.ok(vaultAccount.tokenMint !== undefined, "Missing tokenMint");
      assert.ok(vaultAccount.amount !== undefined, "Missing amount");
      assert.ok(vaultAccount.vaultType !== undefined, "Missing vaultType");
      assert.ok(vaultAccount.bump !== undefined, "Missing bump");
    });
  });

  describe('Flow Query Tests', () => {
    it('should find all flows created by the user', async () => {
      // Query for flows created by the current wallet
      const userFlows = await program.account.flow.all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator (8) + flow_id (varies, but we're looking at creator field)
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      
      // Make sure we find at least the flow we created
      assert.ok(userFlows.length >= 1, "Should find at least one flow");
      
      // Check if our specific flow is in the results
      const ourFlow = userFlows.find(f => f.account.flowId === flowId);
      assert.ok(ourFlow, "Should find our specific flow");
      
      // Verify some details of our flow
      assert.strictEqual(
        ourFlow.account.creator.toString(),
        wallet.publicKey.toString(),
        "Creator should match"
      );
    });
    
    it('should find the vault for our flow', async () => {
      // Query for vaults associated with our flow
      const flowVaults = await program.account.vault.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: flowPda.toBase58(),
          },
        },
      ]);
      
      // We should find exactly one vault for our direct flow
      assert.strictEqual(flowVaults.length, 1, "Should find exactly one vault");
      
      // Verify it's the right vault
      const vault = flowVaults[0];
      assert.strictEqual(
        vault.publicKey.toString(),
        vaultPda.toString(),
        "Vault address should match"
      );
      
      assert.strictEqual(
        vault.account.flow.toString(),
        flowPda.toString(),
        "Vault should reference our flow"
      );
      
      assert.strictEqual(
        vault.account.tokenMint.toString(),
        tokenMint.toString(),
        "Vault should have our token mint"
      );
    });
  });
});

