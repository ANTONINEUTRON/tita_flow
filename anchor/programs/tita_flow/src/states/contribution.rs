use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Contribution {       
    pub flow: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub vault: Pubkey,          // Which vault received the contribution
    pub token_mint: Pubkey,
    pub bump: u8,
}