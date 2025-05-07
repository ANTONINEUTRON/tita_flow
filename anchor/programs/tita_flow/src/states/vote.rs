use anchor_lang::prelude::*;

use super::VoteType;


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
