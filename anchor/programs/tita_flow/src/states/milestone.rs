use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Milestone {
    pub flow: Pubkey,                
    pub milestone_id: u32,          
    pub amount: u64,                 // Amount allocated
    pub deadline: i64,               // Target completion date
    pub is_completed: bool,          // Whether milestone is marked complete
    pub is_approved: bool,           // Whether milestone is approved for payout
    pub total_votes: u64,            // Total weighted votes
    pub votes_needed: u64,           // Votes needed to approve in percentage 0 - 100 (default: 51)
    pub bump: u8,
}