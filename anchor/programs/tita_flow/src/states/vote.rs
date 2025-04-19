use anchor_lang::prelude::*;

use super::VoteType;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum VotingMechanism {
    Standard,//simple vote based on contribution weight
    Futarchy,
    Quadratic,
    TimeWeighted,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    pub proposal: Pubkey,            // The proposal being voted on
    pub voter: Pubkey,               // The account casting the vote
    pub vote_type: VoteType,         // How they voted
    pub voting_power: u64,           // How much voting power they had
    pub voted_at: i64,               // When the vote was cast
    pub bump: u8,
}
