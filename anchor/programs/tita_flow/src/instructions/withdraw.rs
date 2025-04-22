use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked};

use crate::constants::TITA_FLOW_TA_SEED;
use crate::states::{Flow, FlowStatus};
use crate::errors::TitaErrors;


// if flow is not cancelled then proceed
// if milestone vec is empty then withdraw amount specified to wallet passed

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        constraint = flow.creator == creator.key() @ TitaErrors::UnauthorizedWithdrawal,
        constraint = flow.flow_status != FlowStatus::Canceled @ TitaErrors::FlowCanceled
    )]
    pub flow: Account<'info, Flow>,
    
    #[account(
        mut,
        constraint = flow_token_account.mint == token_mint.key() @ TitaErrors::InvalidTokenAccount,
    )]
    pub flow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = recipient_token_account.mint == flow.token_mint @ TitaErrors::InvalidTokenMint,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info>{
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        // Validate the withdrawal amount
        require!(amount > 0, TitaErrors::InvalidContributionAmount);
        
        // Check if flow has available funds for withdrawal
        if self.flow.balance < amount {
            return err!(TitaErrors::InsufficientFunds);
        }
        
        // Transfer tokens from flow treasury to recipient
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
                    from: flow.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.recipient_token_account.to_account_info(),
                    authority: self.flow.to_account_info(),
                },
                signer,
            ),
            amount,
            self.token_mint.decimals,
        )?;

        
        // Update flow's available funds
        self.flow.balance = self.flow.balance
            .checked_sub(amount)
            .ok_or(TitaErrors::MathOverflow)?;
        
        // Log withdrawal details
        msg!(
            "Withdrawn {} tokens from flow {}. Remaining available: {}", 
            amount, 
            self.flow.flow_id,
            self.flow.balance
        );
        
        Ok(())
    }
}
