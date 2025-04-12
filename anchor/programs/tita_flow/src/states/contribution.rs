use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Contribution {       
    pub flow: Pubkey,                // Reference to the flow
    pub contributor: Pubkey,         // Who made the contribution
    pub total_amount: u64,           // Total amount contributed
    pub first_contribution: i64,     // Timestamp of first contribution
    pub last_contribution: i64,      // Timestamp of last contribution
    pub contribution_count: u32,     // Number of separate contribution transactions
    pub token_mint: Pubkey,          // Token mint used for contribution
    pub bump: u8,
}
