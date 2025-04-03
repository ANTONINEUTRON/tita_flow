// use anchor_lang::prelude::*;
// use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface};

////WEIGHTED DONATIONS STILL BUGGY 
//// UTILIZE THE DIRECT CONTRIBUTIONS AS INSTRUCTIONS FROM FRONTEND
////


// use crate::{
//     errors::TitaErrors,
//     states::{Contribution, Flow, FlowStatus, RuleType},
// };

// #[derive(Accounts)]
// pub struct ContributeWeighted<'info> {
//     #[account(mut)]
//     pub contributor: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [
//             b"tita-flow",
//             flow.flow_id.as_bytes(),
//             flow.creator.as_ref()
//         ],
//         bump = flow.bump,
//         constraint = flow.flow_status == FlowStatus::Active @ TitaErrors::InactiveFlow,
//         constraint = (flow.end_date.is_none() || flow.end_date.unwrap() > Clock::get()?.unix_timestamp) @ TitaErrors::FlowEnded,
//     )]
//     pub flow: Account<'info, Flow>,

//     #[account(
//         init,
//         payer = contributor,
//         space = 8 + Contribution::INIT_SPACE,
//         seeds = [
//             b"tita-contribution",
//             flow.key().as_ref(),
//             contributor.key().as_ref(),
//             &Clock::get()?.unix_timestamp.to_le_bytes()
//         ],
//         bump,
//     )]
//     pub contribution: Account<'info, Contribution>,

//     #[account(
//         mut,
//         seeds = [
//             b"tita-vault",
//             flow.key().as_ref(),
//             token_mint.key().as_ref()
//         ],
//         bump,
//         token::mint = token_mint,
//         token::authority = flow,
//     )]
//     pub vault: InterfaceAccount<'info, TokenAccount>,

//     #[account(mut)]
//     pub recipients_token_account: InterfaceAccount<'info, TokenAccount>,

//     #[account(
//         mut,
//         constraint = user_token_account.owner == contributor.key() @ TitaErrors::InvalidOwner,
//         constraint = user_token_account.mint == token_mint.key() @ TitaErrors::InvalidMint,
//     )]
//     pub user_token_account: InterfaceAccount<'info, TokenAccount>,

//     pub token_mint: InterfaceAccount<'info, Mint>,
//     pub token_program: Interface<'info, TokenInterface>,
//     pub system_program: Program<'info, System>,
// }

// impl<'info> ContributeWeighted<'info> {
//     pub fn contribute_weighted(
//         &mut self,
//         amount: u64,
//         distribution: Vec<(Pubkey, u64)>,
//         bump: u8
//     ) -> Result<()> {
//         // Validate inputs
//         require!(!distribution.is_empty(), TitaErrors::EmptyDistribution);
//         require!(amount > 0, TitaErrors::InvalidAmount);

//         // Calculate sum of all distribution amounts
//         let mut total_distribution: u64 = 0;
//         for (_, token_amount) in &distribution {
//             total_distribution = total_distribution
//                 .checked_add(*token_amount)
//                 .ok_or(TitaErrors::MathOverflow)?;
//         }

//         // Ensure total doesn't exceed amount
//         require!(
//             total_distribution <= amount,
//             TitaErrors::DistributionExceedsContribution
//         );

//         // Record weighted distribution
//         for (recipient, token_amount) in distribution {
//             // Skip zero amounts
//             if token_amount == 0 {
//                 continue;
//             }

//             // Transfer tokens to the recipient
//             self.direct_transfer(token_amount);
//         }

//         // Update flow state
//         let flow = &mut self.flow;
//         flow.raised = flow
//             .raised
//             .checked_add(amount)
//             .ok_or(TitaErrors::MathOverflow)?;

//         // If this is a new contributor, increment contributor count
//         // Simplified version - you'd need to track unique contributors
//         flow.contributor_count = flow
//             .contributor_count
//             .checked_add(1)
//             .ok_or(TitaErrors::MathOverflow)?;

//         //set contribution account
//         let contribution = &mut self.contribution;
//         contribution.flow = flow.key();
//         contribution.contributor = self.contributor.key();
//         contribution.amount = amount;
//         contribution.timestamp = Clock::get()?.unix_timestamp;
//         contribution.bump = bump;


//         // Emit overall contribution event
//         emit!(ContributionEvent {
//             flow_id: flow.flow_id.clone(),
//             contributor: self.contributor.key(),
//             amount,
//             timestamp: Clock::get()?.unix_timestamp,
//         });

//         Ok(())
//     }

//     fn direct_transfer(&self, amount: u64, receipient_t_a: ) {
//         let _ = transfer_checked(
//             CpiContext::new(
//                 self.token_program.to_account_info(),
//                 anchor_spl::token_interface::TransferChecked {
//                     from: self.user_token_account.to_account_info(),
//                     mint: self.token_mint.to_account_info(),
//                     to: self.flow.to_account_info(),
//                     authority: self.contributor.to_account_info(),
//                 },
//             ),
//             amount,
//             self.token_mint.decimals,
//         );
//     }
// }


// #[event]
// pub struct ContributionEvent {
//     pub flow_id: String,
//     pub contributor: Pubkey,
//     pub amount: u64,
//     pub timestamp: i64,
// }
