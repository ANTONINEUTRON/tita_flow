use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::{
    constants::TITA_CONTRIBUTION_SEED,
    errors::TitaErrors,
    states::{Contribution, Flow, FlowStatus},
};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(mut,
        constraint = flow.flow_status == FlowStatus::Active @ TitaErrors::FlowNotActive,
        constraint = flow.token_mint == token_mint.key() @ TitaErrors::InvalidTokenMint,)]
    pub flow: Account<'info, Flow>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = 8 + Contribution::INIT_SPACE,
        seeds = [
            TITA_CONTRIBUTION_SEED,
            flow.key().as_ref(),
            contributor.key().as_ref()
        ],
        bump
    )]
    pub contribution: Account<'info, Contribution>,


    #[account(
        mut,
        constraint = contributor_token_account.mint == token_mint.key() @ TitaErrors::InvalidTokenAccount,
        constraint = contributor_token_account.owner == contributor.key() @ TitaErrors::InvalidTokenOwner,
    )]
    pub contributor_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = flow_token_account.mint == token_mint.key() @ TitaErrors::InvalidTokenAccount,
    )]
    pub flow_token_account: InterfaceAccount<'info, TokenAccount>,
    

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Contribute<'info> {
    pub fn contribute(&mut self, amount: u64, contribution_bump: u8) -> Result<()> {
        // Validate the contribution amount
        require!(amount > 0, TitaErrors::InvalidContributionAmount);
        
        // Check if flow is still accepting contributions
        if let Some(end_date) = self.flow.end_date {
            let current_time = Clock::get()?.unix_timestamp;
            require!(current_time <= end_date, TitaErrors::FlowEnded);
        }
        
        // Check if flow is accepting contributions (start time)
        if let Some(start_date) = self.flow.start_date {
            let current_time = Clock::get()?.unix_timestamp;
            require!(current_time >= start_date, TitaErrors::FlowNotStarted);
        }
        
        // Transfer tokens from contributor to flow token account
        let cpi_accounts = Transfer {
            from: self.contributor_token_account.to_account_info(),
            to: self.flow_token_account.to_account_info(),
            authority: self.contributor.to_account_info(),
        };
        
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Initialize contribution if new
        let current_timestamp = Clock::get()?.unix_timestamp;
        
        if self.contribution.contribution_count == 0 {
            // First-time setup
            self.contribution.flow = self.flow.key();
            self.contribution.contributor = self.contributor.key();
            self.contribution.token_mint = self.token_mint.key();
            self.contribution.total_amount = 0; // Will add amount below
            self.contribution.first_contribution = current_timestamp;
            self.contribution.last_contribution = current_timestamp;
            self.contribution.contribution_count = 0; // Will increment below
            self.contribution.bump = contribution_bump;
        }
        
        // Update the contribution account
        self.contribution.total_amount = self.contribution.total_amount
            .checked_add(amount)
            .ok_or(TitaErrors::MathOverflow)?;
            
        self.contribution.last_contribution = current_timestamp;
        self.contribution.contribution_count = self.contribution.contribution_count
            .checked_add(1)
            .ok_or(TitaErrors::MathOverflow)?;
            
        // Update the flow account
        self.flow.raised = self.flow.raised
            .checked_add(amount)
            .ok_or(TitaErrors::MathOverflow)?;
            
        // If this is a new contributor (first contribution), increment the flow's contributor count
        if self.contribution.contribution_count == 1 {
            self.flow.contributor_count = self.flow.contributor_count
                .checked_add(1)
                .ok_or(TitaErrors::MathOverflow)?;
        }
        
        // Emit contribution event
        emit!(ContributionEvent {
            flow: self.flow.key(),
            contributor: self.contributor.key(),
            amount,
            total_contributed: self.contribution.total_amount,
            timestamp: current_timestamp,
        });
        
        Ok(())
    }
}


// Event emitted when a contribution is made
#[event]
pub struct ContributionEvent {
    pub flow: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub total_contributed: u64,
    pub timestamp: i64,
}