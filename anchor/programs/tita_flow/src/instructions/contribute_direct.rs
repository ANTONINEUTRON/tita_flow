use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, transfer_checked};

use crate::{errors::TitaErrors, states::{Contribution, Flow, FlowStatus, RuleType}};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct ContributeDirect<'info> {
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
        constraint = flow.has_rule(RuleType::Direct) @ TitaErrors::RuleNotSupported,
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
        init,
        payer = contributor,
        space = 8 + Contribution::INIT_SPACE,
        seeds = [
            b"tita-contribution",
            flow.key().as_ref(),
            contributor.key().as_ref(),
            (flow.contributor_count + 1).to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub contribution: Account<'info, Contribution>,


    #[account(
        mut,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>
}

impl<'info> ContributeDirect<'info> {
    pub fn contribute(
        &mut self, 
        amount: u64,
        bump: u8
    ) -> Result<()>{
        let _ = transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: self.user_token_account.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.vault.to_account_info(),
                    authority: self.contributor.to_account_info(),
                },
            ),
            amount,
            self.token_mint.decimals,
        );

        let flow = &mut self.flow;
        flow.contributor_count += 1;
        flow.raised += amount;
        
        //set contribution account
        let contribution = &mut self.contribution;
        contribution.flow = flow.key();
        contribution.contributor = self.contributor.key();
        contribution.amount = amount;
        contribution.timestamp = Clock::get()?.unix_timestamp;
        contribution.token_mint = self.token_mint.key();
        contribution.bump = bump;

        Ok(())
    }

}