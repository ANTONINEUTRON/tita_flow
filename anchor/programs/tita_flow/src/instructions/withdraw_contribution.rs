use anchor_lang::prelude::*;
use anchor_spl::token_interface::{TokenAccount, Mint, TokenInterface, transfer_checked};

use crate::constants::TITA_FLOW_TA_SEED;
use crate::states::{Flow, FlowStatus, Contribution};
use crate::errors::TitaErrors;

/// Allows a contributor to withdraw their funds from a cancelled flow
/// 
/// This instruction can only be executed when a flow is in Cancelled status.
/// The contributor will receive a proportional refund based on their contribution
/// and the remaining funds in the flow.
#[derive(Accounts)]
pub struct WithdrawContribution<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    
    #[account(
        mut,
        constraint = flow.flow_status == FlowStatus::Canceled @ TitaErrors::FlowNotCanceled,
    )]
    pub flow: Account<'info, Flow>,
    
    #[account(
        mut,
        constraint = contribution.flow == flow.key() @ TitaErrors::InvalidContribution,
        constraint = contribution.contributor == contributor.key() @ TitaErrors::UnauthorizedContributor,
        constraint = !contribution.refunded @ TitaErrors::AlreadyRefunded,
    )]
    pub contribution: Account<'info, Contribution>,
    
    #[account(
        mut,
        constraint = flow_token_account.key() == flow.flow_ta @ TitaErrors::InvalidFlowTokenAccount,
    )]
    pub flow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = contributor_token_account.owner == contributor.key() @ TitaErrors::InvalidTokenOwner,
        constraint = contributor_token_account.mint == flow.token_mint @ TitaErrors::InvalidTokenMint,
    )]
    pub contributor_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>
}

impl<'info> WithdrawContribution<'info>{

    pub fn withdraw_contribution(&mut self) -> Result<()> {
        let flow = self.flow.clone();
        let contribution = self.contribution.clone();
        
        // Calculate the refundable proportion
        let total_refundable = flow.balance;
        let total_contributions = flow.raised;
        
        // Calculate refund amount (proportional to contribution)
        let refund_amount = if total_contributions == 0 {
            0 // Avoid division by zero
        } else {
            ((contribution.total_amount as u128)
                .checked_mul(total_refundable as u128)
                .ok_or(TitaErrors::MathOverflow)?
                .checked_div(total_contributions as u128)
                .ok_or(TitaErrors::MathOverflow)?) as u64
        };
        
        // Ensure refund amount is non-zero and doesn't exceed treasury balance
        require!(refund_amount > 0, TitaErrors::RefundTooSmall);
        
        // Check if treasury has enough funds
        let treasury_balance = self.flow_token_account.amount;
        require!(refund_amount <= treasury_balance, TitaErrors::InsufficientTreasuryFunds);
        
        // Transfer tokens from flow treasury to contributor
        let flow = self.flow.clone();
        let flow_key = flow.key();
        let token_mint_key = self.token_mint.key();
        let seeds = [
            TITA_FLOW_TA_SEED,
            flow_key.as_ref(),
            token_mint_key.as_ref(),
            &[flow.bump],
        ];
        let signer = &[&seeds[..]];

        // Transfer tokens
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: self.flow_token_account.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.contributor_token_account.to_account_info(),
                    authority: self.flow.to_account_info(),
                },
                signer,
            ),
            refund_amount,
            self.token_mint.decimals,
        )?;

        
        // Update contribution record
        let contribution = &mut self.contribution;
        contribution.refunded = true;
        contribution.refund_amount = refund_amount;
        contribution.refunded_at = Some(Clock::get()?.unix_timestamp);
        
        // Update flow's refunded tracking
        let flow = &mut self.flow;
        flow.total_refunded = flow.total_refunded
            .checked_add(refund_amount)
            .ok_or(TitaErrors::MathOverflow)?;
        flow.refunds_count = flow.refunds_count
            .checked_add(1)
            .ok_or(TitaErrors::MathOverflow)?;
        
        // Log the refund
        msg!(
            "Refunded {} tokens to contributor {}. Contribution was {} tokens ({}% of contribution)",
            refund_amount,
            self.contributor.key(),
            contribution.total_amount,
            (refund_amount * 100) / contribution.total_amount
        );
        
        Ok(())
    }


}