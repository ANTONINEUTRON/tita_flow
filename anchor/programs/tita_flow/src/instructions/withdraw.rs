use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::{TITA_FLOW_SEED};
use crate::errors::TitaErrors;
use crate::states::{Flow, FlowStatus};

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

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        // Validate the withdrawal amount
        require!(amount > 0, TitaErrors::InvalidContributionAmount);

        // Check if flow has available funds for withdrawal
        if self.flow.available < amount {
            return err!(TitaErrors::InsufficientFunds);
        }

        // Try to derive the PDA manually to verify
        let (_derived_pda, derived_bump) = Pubkey::find_program_address(
            &[
                TITA_FLOW_SEED,
                self.flow.flow_id.as_bytes(),
                self.flow.creator.as_ref(),
            ],
            &crate::ID,
        );

        // Transfer tokens from flow treasury to recipient
        let flow_id_bytes = self.flow.flow_id.as_bytes();
        let creator_bytes = self.flow.creator.as_ref();
        let bump_bytes = [derived_bump];

        let seeds: &[&[u8]] = &[
            TITA_FLOW_SEED,
            flow_id_bytes,
            creator_bytes,
            &bump_bytes,
        ];

        let signer_seeds = &[seeds];

        // Verify that the flow PDA actually owns the token account
        require!(
            self.flow_token_account.owner == self.flow.key(),
            TitaErrors::InvalidTokenOwner
        );

        // Transfer tokens
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: self.flow_token_account.to_account_info(),
                    mint: self.token_mint.to_account_info(),
                    to: self.recipient_token_account.to_account_info(),
                    authority: self.flow.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
            self.token_mint.decimals,
        )?;

        // Update flow's available funds
        self.flow.available = self
            .flow
            .available
            .checked_sub(amount)
            .ok_or(TitaErrors::MathOverflow)?;

        // Increase withdrawn amount
        self.flow.withdrawn = self
            .flow
            .withdrawn
            .checked_add(amount)
            .ok_or(TitaErrors::MathOverflow)?;

        // Log withdrawal details
        msg!(
            "Withdrawn {} tokens from flow {}. Remaining available: {}",
            amount,
            self.flow.flow_id,
            self.flow.available
        );

        Ok(())
    }
}
