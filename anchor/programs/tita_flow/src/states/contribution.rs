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

    pub refunded: bool,             // Whether the contribution has been refunded
    pub refund_amount: u64,        // Amount to be refunded
    pub refunded_at: Option<i64>, // Timestamp of refund
    
    pub bump: u8,
}
