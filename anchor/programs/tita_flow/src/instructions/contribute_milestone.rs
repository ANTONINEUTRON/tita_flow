use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked};

use crate::{errors::TitaErrors, states::{Flow, FlowStatus, RuleType}};

#[derive(Accounts)]
pub struct ContributeMilestones<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"tita-flow",
            flow.flow_id.as_bytes(),
            flow.creator.as_ref()
        ],
        bump = flow.bump,
        constraint = flow.flow_status == FlowStatus::Active @ TitaErrors::InactiveFlow,
        constraint = (flow.end_date.is_none() || flow.end_date.unwrap() > Clock::get()?.unix_timestamp) @ TitaErrors::FlowEnded,
    )]
    pub flow: Account<'info, Flow>,

    #[account(
        mut,
        seeds = [
            b"tita-vault",
            flow.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint = token_mint,
        token::authority = flow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.owner == contributor.key() @ TitaErrors::InvalidOwner,
        constraint = user_token_account.mint == token_mint.key() @ TitaErrors::InvalidMint,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub creator_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>
}

impl<'info> ContributeMilestones<'info> {
    pub fn contribute(
        &mut self, 
        amount: u64,
    ) -> Result<()>{
        
        
        Ok(())
    }

    fn direct_transfer(&self, amount: u64){
        let _ = transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: self.user_token_account.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.flow.to_account_info(),
                    authority: self.contributor.to_account_info(),
                },
            ),
            amount,
            self.token_mint.decimals,
        );
    }

}