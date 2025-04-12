use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub flow: Pubkey,            // Parent flow
    pub amount: u64,             // Amount allocated to this vault

    // For milestone vaults
    pub milestone_deadline: Option<i64>,
    pub milestone_completed: Option<bool>,

    pub bump: u8,
}