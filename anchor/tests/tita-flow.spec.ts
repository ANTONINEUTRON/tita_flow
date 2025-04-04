import * as anchor from '@coral-xyz/anchor';
import { Program, web3, BN, AnchorError } from '@coral-xyz/anchor';
import { TitaFlow } from '../target/types/tita_flow';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  mintToChecked,
  createAssociatedTokenAccount
} from '@solana/spl-token';
import { before, describe, it } from 'node:test';
import assert from 'assert';

describe('TitaFlow', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TitaFlow as Program<TitaFlow>;
  const wallet = provider.wallet as anchor.Wallet;
  
  // Common test variables
  let tokenMint: web3.PublicKey;
  let userTokenAccount: web3.PublicKey;
  let flowPda: web3.PublicKey;
  let vaultPda: web3.PublicKey;
  let creatorTokenAccount: web3.PublicKey;
  const flowId = "test-flow-1";
  
  // Setup: Create token mint and accounts before tests
  before(async () => {
    // Create a new SPL token mint for testing
    tokenMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      6 // 6 decimals
    );

    // Create a token account for the wallet
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      wallet.publicKey
    );
    userTokenAccount = tokenAccount.address;

    // Mint some tokens to the wallet
    await mintTo(
      provider.connection,
      wallet.payer,
      tokenMint,
      userTokenAccount,
      wallet.publicKey,
      1_000_000_000 // 1,000 tokens
    );

    // Derive PDAs for testing
    const [flowAddress] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tita-flow"),
        Buffer.from(flowId),
        wallet.publicKey.toBuffer()
      ],
      program.programId
    );
    flowPda = flowAddress;

    const [vaultAddress] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tita-vault"),
        flowPda.toBuffer(),
        tokenMint.toBuffer()
      ],
      program.programId
    );
    vaultPda = vaultAddress;

    // Create token accounts for both user and creator
    const userAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      wallet.publicKey
    );
    userTokenAccount = userAta.address;

    // For simplicity, in the test we'll use the same wallet as creator
    // In a real scenario, this would be a different wallet
    const creatorAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      wallet.publicKey // Same as creator in this test
    );
    creatorTokenAccount = creatorAta.address;

    // Mint some tokens to the user's account for testing
    await mintToChecked(
      provider.connection,
      wallet.payer,
      tokenMint,
      userTokenAccount,
      wallet.publicKey, // Mint authority (from the setup)
      1_000_000_000, // 1000 tokens
      6 // Decimals
    );

  });

  describe('Flow Creation', () => {
    it('should successfully create a flow', async () => {
      // Flow parameters
      const params = {
        flowType: { raise: {} }, // Enum value for a raise flow
        goal: new BN(500_000_000), // 500 tokens
        startTime: new BN(Math.floor(Date.now() / 1000)),
        endTime: new BN(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60), // 30 days later
        rules: [{ direct: {} }],
        voting_mechanism: [{ standard: {} }],
      };

      // Execute the create flow instruction
      const tx = await program.methods
        .createFlow(
          flowId, 
          params.flowType, 
          params.goal, 
          params.startTime, 
          params.endTime, 
          params.rules, 
          params.voting_mechanism
        )
        .accountsPartial({
          creator: wallet.publicKey,
          flow: flowPda,
          vault: vaultPda,
          tokenMint: tokenMint,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc();

      // Verify the flow was created correctly
      const flowAccount = await program.account.flow.fetch(flowPda);
      assert.strictEqual(flowAccount.creator.toString(), wallet.publicKey.toString(), "Flow creator doesn't match expected wallet");
      assert.strictEqual(flowAccount.goal.toString(), params.goal.toString(), "Flow goal doesn't match expected amount");
      assert.deepStrictEqual(flowAccount.flowType, params.flowType, "Flow type doesn't match expected type");
      
      // Verify the vault was created
      const vaultAccount = await getAccount(
        provider.connection,
        vaultPda
      );
      assert.strictEqual(vaultAccount.mint.toString(), tokenMint.toString(), "Vault mint doesn't match expected token mint");
      assert.strictEqual(vaultAccount.owner.toString(), flowPda.toString(), "Vault owner doesn't match flow PDA");
    });

    it('should reject flow creation with invalid parameters', async () => {
      const invalidParams = {
        flowType: { raise: {} },
        goal: new BN(0), // Invalid: goal can't be zero
        startTime: new BN(Math.floor(Date.now() / 1000)),
        endTime: new BN(Math.floor(Date.now() / 1000) - 1000), // Invalid: end time before start time
        rules: [{ direct: {} }],
        voting_mechanism: [{ standard: {} }],
      };

      try {
        await program.methods
          .createFlow(
            "invalid-flow", 
            invalidParams.flowType,
            invalidParams.goal,
            invalidParams.startTime,
            invalidParams.endTime,
            invalidParams.rules,
            invalidParams.voting_mechanism
          )
          .accountsPartial({
            creator: wallet.publicKey,
            flow: flowPda, // Reusing PDA will also cause failure
            vault: vaultPda,
            tokenMint,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId
          })
          .rpc();
        assert.fail("Transaction should have failed");
      } catch (error) {
        if (error instanceof AnchorError) {
          
          // Check against the actual error codes your program is using
          const expectedErrorCodes = [
            "InvalidGoalAmount",       // If you're testing zero goal amount
            "InvalidTimeframe",        // If end_time < start_time
            "NoRulesSpecified",        // If empty rules array
            "EmptyFlowId",             // If flow_id is empty
            "FlowIdTooLong",           // If flow_id is too long
            "InvalidStartTime",        // If start time is in the past
            "InvalidEndTime",          // If end time is in the past
            "ConstraintSeeds"          // Anchor's built-in PDA constraint error
          ];
          
          assert(
            expectedErrorCodes.includes(error.error.errorCode.code), 
            `Expected one of [${expectedErrorCodes.join(', ')}] but got ${error.error.errorCode.code}`
          );
        } else {
          // If it's not an AnchorError, that's unexpected
          console.error("Unexpected error type:", error);
          throw error;
        }
      }
    });
  });



  describe('Direct Contribution', () => {
    // let userTokenAccount: web3.PublicKey;
    // let flowPda: web3.PublicKey;
    // let vaultPda: web3.PublicKey;
    // const flowId = "test-direct-flow";
    let contributionPda: web3.PublicKey;
    let contributionBump: number;
    const contributionAmount = new BN(100_000_000); // 100 tokens
    

    it('should successfully contribute directly to a flow', async () => {
      // Generate a timestamp for the contribution PDA
      const currentTimestamp = new BN(Math.floor(Date.now() / 1000));
      
      // Get the current contributor count and add 1 to match what the program does
      const flowBefore = await program.account.flow.fetch(flowPda);
      const contributorCount = flowBefore.contributorCount + 1; // Add 1 to match the program

      // Now find the contribution PDA with correctly matching seeds
      const [contributionAddress, bump] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("tita-contribution"),
          flowPda.toBuffer(),
          wallet.publicKey.toBuffer(),
          new BN(contributorCount).toArrayLike(Buffer, 'le', 4) // Use proper 4-byte little-endian buffer
        ],
        program.programId
      );
      contributionPda = contributionAddress;
      contributionBump = bump;

      // Get initial balances
      const userTokenAccountBefore = await getAccount(
        provider.connection,
        userTokenAccount
      );
      
      const vaultBefore = await getAccount(
        provider.connection,
        vaultPda
      );
      
      // Get initial flow state
      const initialRaised = flowBefore.raised;
      const initialContributorCount = flowBefore.contributorCount;
      
      // Execute the direct contribution
      const tx = await program.methods
        .contributeDirect(contributionAmount)
        .accountsPartial({
          contributor: wallet.publicKey,
          flow: flowPda,
          vault: vaultPda,
          contribution: contributionPda,
          userTokenAccount: userTokenAccount,
          tokenMint: tokenMint,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId
        })
        .rpc();

      // Verify user token account balance was reduced
      const userTokenAccountAfter = await getAccount(
        provider.connection,
        userTokenAccount
      );
      assert.strictEqual(
        BigInt(userTokenAccountBefore.amount) - BigInt(userTokenAccountAfter.amount),
        BigInt(contributionAmount.toString()),
        "User token account was not debited correctly"
      );
      
      // Verify vault received the tokens
      const vaultAfter = await getAccount(
        provider.connection,
        vaultPda
      );
      assert.strictEqual(
        BigInt(vaultAfter.amount) - BigInt(vaultBefore.amount),
        BigInt(contributionAmount.toString()),
        "Vault did not receive the correct amount"
      );
      
      // Verify flow state was updated
      const flowAfter = await program.account.flow.fetch(flowPda);
      assert.strictEqual(
        flowAfter.raised.toString(),
        initialRaised.add(contributionAmount).toString(),
        "Flow raised amount was not updated correctly"
      );
      
      assert.strictEqual(
        flowAfter.contributorCount,
        initialContributorCount + 1,
        "Contributor count was not incremented"
      );
      
      // Verify contribution account was created with correct data
      const contributionAccount = await program.account.contribution.fetch(contributionPda);
      assert.strictEqual(
        contributionAccount.flow.toString(), 
        flowPda.toString(),
        "Contribution has incorrect flow reference"
      );
      
      assert.strictEqual(
        contributionAccount.contributor.toString(),
        wallet.publicKey.toString(),
        "Contribution has incorrect contributor"
      );
      
      assert.strictEqual(
        contributionAccount.amount.toString(),
        contributionAmount.toString(),
        "Contribution has incorrect amount"
      );
      
      assert.strictEqual(
        contributionAccount.tokenMint.toString(),
        tokenMint.toString(),
        "Contribution has incorrect token mint"
      );
      
      assert.strictEqual(
        contributionAccount.bump,
        contributionBump,
        "Contribution has incorrect bump"
      );
    });
  });

});