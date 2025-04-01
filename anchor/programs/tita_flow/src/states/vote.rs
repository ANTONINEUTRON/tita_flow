use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum VotingMechanism {
    Standard,
    Futarchy,
    Quadratic,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    pub proposal: Pubkey,            // Proposal account
    pub voter: Pubkey,               // Voter's wallet address
    pub option_id: u8,               // Chosen option
    pub weight: u64,                 // Vote weight
    pub timestamp: i64,
    pub bump: u8,  
}