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

describe('tita_flow', () => {
  // Configure the client to use the local cluster.
  
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
      { tokenWeighted: {} },
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
      {tokenWeighted: {}},
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
        { tokenWeighted: {} },
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
        { tokenWeighted: {} },
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


// Proposal and Voting Tests
describe('proposal and voting', () => {
  let proposalPda: PublicKey;
  const votingDuration = new anchor.BN(3600); // 1 hour
  const quorumPercentage = 50; // 50%
  const approvalPercentage = 60; // 60%

  it('should create a proposal for milestone completion', async () => {
    // Find proposal PDA
    const flowAccount = await program.account.flow.fetch(milestoneFlowPda);
    const proposalCount = flowAccount.proposalCount;
    [proposalPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("tita-proposal"),
        milestoneFlowPda.toBuffer(),
        Buffer.from([proposalCount]),
      ],
      program.programId
    );

    await program.methods.createProposal(
      {
        milestoneCompletion: {
          milestoneId: 1,
        },
      },
      votingDuration,
      quorumPercentage,
      approvalPercentage
    )
      .accountsPartial({
        proposer: creator.publicKey,
        flow: milestoneFlowPda,
        proposal: proposalPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    // Verify proposal account
    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.ok(proposalAccount.flow.equals(milestoneFlowPda));
    assert.ok(proposalAccount.proposer.equals(creator.publicKey));
    assert.deepStrictEqual(proposalAccount.proposalType, {
      milestoneCompletion: { milestoneId: 1 },
    });
    assert.deepStrictEqual(proposalAccount.status, { active: {} });
    assert.ok(proposalAccount.votesFor.eq(new anchor.BN(0)));
    assert.ok(proposalAccount.votesAgainst.eq(new anchor.BN(0)));
    assert.strictEqual(proposalAccount.quorumPercentage, quorumPercentage);
    assert.strictEqual(proposalAccount.approvalPercentage, approvalPercentage);

    // Verify flow account was updated with active proposal
    const updatedFlowAccount = await program.account.flow.fetch(milestoneFlowPda);
    assert.ok(updatedFlowAccount.activeProposal?.equals(proposalPda));
  });

  // it('should fail to create proposal when one is already active', async () => {
  //   try {
  //     const [invalidProposalPda] = await PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("proposal"),
  //         milestoneFlowPda.toBuffer(),
  //         Buffer.from([1]), // Next proposal index
  //       ],
  //       program.programId
  //     );

  //     await program.methods.createProposal(
  //       {
  //         milestoneCompletion: {
  //           milestoneId: 2,
  //         },
  //       },
  //       votingDuration,
  //       quorumPercentage,
  //       approvalPercentage
  //     )
  //       .accountsPartial({
  //         proposer: creator.publicKey,
  //         flow: milestoneFlowPda,
  //         proposal: invalidProposalPda,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([creator])
  //       .rpc();

  //     assert.fail("Should have thrown error for active proposal exists");
  //   } catch (err: any) {
  //     assert.strictEqual(err.error.errorCode.code, "ActiveProposalExists");
  //     assert.strictEqual(err.error.errorCode.number, 6022);
  //   }
  // });

  // it('should vote on a proposal', async () => {
  //   // First contribute to the milestone flow to get voting power
  //   const [milestoneContributionPda] = await PublicKey.findProgramAddressSync(
  //     [
  //       TITA_CONTRIBUTION_SEED,
  //       milestoneFlowPda.toBuffer(),
  //       contributor.publicKey.toBuffer(),
  //     ],
  //     program.programId
  //   );

  //   await program.methods.contribute(contributionAmount)
  //     .accountsPartial({
  //       contributor: contributor.publicKey,
  //       flow: milestoneFlowPda,
  //       contribution: milestoneContributionPda,
  //       contributorTokenAccount: contributorTokenAccount,
  //       flowTokenAccount: flowTokenAccount,
  //       tokenMint: tokenMint,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([contributor])
  //     .rpc();

  //   // Now vote on the proposal
  //   await program.methods.vote({ for: {} })
  //     .accountsPartial({
  //       voter: contributor.publicKey,
  //       proposal: proposalPda,
  //       flow: milestoneFlowPda,
  //       contribution: milestoneContributionPda,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     })
  //     .signers([contributor])
  //     .rpc();

  //   // Verify vote was recorded
  //   const proposalAccount = await program.account.proposal.fetch(proposalPda);
  //   assert.ok(proposalAccount.votesFor.eq(contributionAmount));
  //   assert.ok(proposalAccount.votesAgainst.eq(new anchor.BN(0)));
  // });

  // it('should fail to vote with zero voting power', async () => {
  //   const newContributor = anchor.web3.Keypair.generate();
  //   await fundWallet(newContributor.publicKey, provider.connection);

  //   try {
  //     await program.methods.vote({ for: {} })
  //       .accountsPartial({
  //         voter: newContributor.publicKey,
  //         proposal: proposalPda,
  //         flow: milestoneFlowPda,
  //         contribution: contributionPda, // This is for the direct flow, not milestone flow
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([newContributor])
  //       .rpc();

  //     assert.fail("Should have thrown error for zero voting power");
  //   } catch (err: any) {
  //     assert.strictEqual(err.error.errorCode.code, "ZeroVotingPower");
  //     assert.strictEqual(err.error.errorCode.number, 6030);
  //   }
  // });

  // it('should fail to vote twice with same contribution', async () => {
  //   try {
  //     const [milestoneContributionPda] = await PublicKey.findProgramAddressSync(
  //       [
  //         TITA_CONTRIBUTION_SEED,
  //         milestoneFlowPda.toBuffer(),
  //         contributor.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //     await program.methods.vote({ for: {} })
  //       .accountsPartial({
  //         voter: contributor.publicKey,
  //         proposal: proposalPda,
  //         flow: milestoneFlowPda,
  //         contribution: milestoneContributionPda,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .signers([contributor])
  //       .rpc();

  //     assert.fail("Should have thrown error for already voted");
  //   } catch (err: any) {
  //     assert.strictEqual(err.error.errorCode.code, "AlreadyVoted");
  //     assert.strictEqual(err.error.errorCode.number, 6031);
  //   }
  // });
});

// Refund Tests
// describe('refund functionality', () => {
//   it('should refund contribution when flow is canceled', async () => {
//     // First cancel the flow
//     await program.methods.createProposal(
//       { flowCancellation: {} },
//       new anchor.BN(3600), // 1 hour voting
//       30, // 30% quorum
//       50 // 50% approval
//     )
//       .accountsPartial({
//         proposer: creator.publicKey,
//         flow: flowPda,
//         proposal: proposalPda,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([creator])
//       .rpc();

//     // Vote to cancel (simulate enough votes)
//     // In a real test you'd need actual votes from contributors
//     // This is simplified for testing purposes
//     await program.methods
//       .withdraw(new anchor.BN(0)) // Admin function to cancel flow
//       .accountsPartial({
//         creator: creator.publicKey,
//         flow: flowPda,
//         flowTokenAccount: flowTokenAccount,
//         recipientTokenAccount: contributorTokenAccount, // Doesn't matter for cancel
//         tokenMint: tokenMint,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([creator])
//       .rpc();

//     // Now attempt refund
//     const initialContributorBalance = await provider.connection.getTokenAccountBalance(contributorTokenAccount);

//     await program.methods.refund()
//       .accountsPartial({
//         contributor: contributor.publicKey,
//         flow: flowPda,
//         contribution: contributionPda,
//         flowTokenAccount: flowTokenAccount,
//         contributorTokenAccount: contributorTokenAccount,
//         tokenMint: tokenMint,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([contributor])
//       .rpc();

//     // Verify refund
//     const finalContributorBalance = await provider.connection.getTokenAccountBalance(contributorTokenAccount);
//     assert.ok(finalContributorBalance.value.amount > initialContributorBalance.value.amount);

//     // Verify contribution marked as refunded
//     const contributionAccount = await program.account.contribution.fetch(contributionPda);
//     assert.strictEqual(contributionAccount.refunded, true);
//     assert.ok(contributionAccount.refundAmount.eq(contributionAmount));
//   });

//   // it('should fail refund when flow is not canceled', async () => {
//   //   try {
//   //     await program.methods.refund()
//   //       .accountsPartial({
//   //         contributor: contributor.publicKey,
//   //         flow: milestoneFlowPda, // This flow is still active
//   //         contribution: contributionPda,
//   //         flowTokenAccount: flowTokenAccount,
//   //         contributorTokenAccount: contributorTokenAccount,
//   //         tokenMint: tokenMint,
//   //         tokenProgram: TOKEN_PROGRAM_ID,
//   //         systemProgram: anchor.web3.SystemProgram.programId,
//   //       })
//   //       .signers([contributor])
//   //       .rpc();

//   //     assert.fail("Should have thrown error for flow not canceled");
//   //   } catch (err: any) {
//   //     assert.strictEqual(err.error.errorCode.code, "FlowNotCanceled");
//   //     assert.strictEqual(err.error.errorCode.number, 6042);
//   //   }
//   // });

//   // it('should fail refund when already refunded', async () => {
//   //   try {
//   //     await program.methods.refund()
//   //       .accountsPartial({
//   //         contributor: contributor.publicKey,
//   //         flow: flowPda, // This flow was canceled in previous test
//   //         contribution: contributionPda,
//   //         flowTokenAccount: flowTokenAccount,
//   //         contributorTokenAccount: contributorTokenAccount,
//   //         tokenMint: tokenMint,
//   //         tokenProgram: TOKEN_PROGRAM_ID,
//   //         systemProgram: anchor.web3.SystemProgram.programId,
//   //       })
//   //       .signers([contributor])
//   //       .rpc();

//   //     assert.fail("Should have thrown error for already refunded");
//   //   } catch (err: any) {
//   //     assert.strictEqual(err.error.errorCode.code, "AlreadyRefunded");
//   //     assert.strictEqual(err.error.errorCode.number, 6044);
//   //   }
//   // });
// });

// // Withdrawal Tests
// describe('withdrawal functionality', () => {
//   it('should allow creator to withdraw funds', async () => {
//     // Create recipient token account for creator
//     const recipientTokenAccount = await getAssociatedTokenAddress(
//       tokenMint,
//       creator.publicKey
//     );
//     await createAssociatedTokenAccount(
//       provider.connection,
//       creator,
//       tokenMint,
//       creator.publicKey
//     );

//     const initialRecipientBalance = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
//     const withdrawAmount = new anchor.BN(50000); // 50,000 tokens

//     await program.methods.withdraw(withdrawAmount)
//       .accountsPartial({
//         creator: creator.publicKey,
//         flow: flowPda,
//         flowTokenAccount: flowTokenAccount,
//         recipientTokenAccount: recipientTokenAccount,
//         tokenMint: tokenMint,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([creator])
//       .rpc();

//     // Verify withdrawal
//     const finalRecipientBalance = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
//     assert.ok(
//       BigInt(finalRecipientBalance.value.amount) - BigInt(initialRecipientBalance.value.amount) ===
//       BigInt(withdrawAmount.toString())
//     );

//     // Verify flow account updated
//     const flowAccount = await program.account.flow.fetch(flowPda);
//     assert.ok(flowAccount.withdrawn.eq(withdrawAmount));
//     assert.ok(flowAccount.balance.eq(flowAccount.raised.sub(withdrawAmount)));
//   });

//   it('should fail withdrawal by non-creator', async () => {
//     try {
//       const recipientTokenAccount = await getAssociatedTokenAddress(
//         tokenMint,
//         contributor.publicKey
//       );

//       await program.methods.withdraw(new anchor.BN(10000))
//         .accountsPartial({
//           creator: contributor.publicKey, // Not the creator
//           flow: flowPda,
//           flowTokenAccount: flowTokenAccount,
//           recipientTokenAccount: recipientTokenAccount,
//           tokenMint: tokenMint,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .signers([contributor])
//         .rpc();

//       assert.fail("Should have thrown error for unauthorized withdrawal");
//     } catch (err: any) {
//       assert.strictEqual(err.error.errorCode.code, "UnauthorizedWithdrawal");
//       assert.strictEqual(err.error.errorCode.number, 6039);
//     }
//   });

//   it('should fail withdrawal with insufficient funds', async () => {
//     try {
//       const recipientTokenAccount = await getAssociatedTokenAddress(
//         tokenMint,
//         creator.publicKey
//       );

//       // Try to withdraw more than available
//       const flowAccount = await program.account.flow.fetch(flowPda);
//       const excessiveAmount = flowAccount.balance.add(new anchor.BN(1));

//       await program.methods.withdraw(excessiveAmount)
//         .accountsPartial({
//           creator: creator.publicKey,
//           flow: flowPda,
//           flowTokenAccount: flowTokenAccount,
//           recipientTokenAccount: recipientTokenAccount,
//           tokenMint: tokenMint,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .signers([creator])
//         .rpc();

//       assert.fail("Should have thrown error for insufficient funds");
//     } catch (err: any) {
//       assert.strictEqual(err.error.errorCode.code, "InsufficientFunds");
//       assert.strictEqual(err.error.errorCode.number, 6041);
//     }
//   });
// });

