use anchor_lang::prelude::*;

use super::VotingMechanism;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum FlowType {
    Raise,
    Distribute,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum FlowStatus {
    Active,
    Completed,
    Canceled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RuleType {
    Direct,
    Milestone,
    Weighted,
}


#[account]
#[derive(InitSpace)]
pub struct Flow {
    #[max_len(32)]
    pub flow_id: String,
    pub creator: Pubkey,
    pub goal: u64,                   // Target amount
    pub raised: u64,                 // Current raised amount
    pub start_date: Option<i64>,             // Start timestamp
    pub end_date: Option<i64>,  
    pub contributor_count: u32,      // Number of contributors
    pub milestone_count: u32,        // Number of milestones
    pub proposal_count: u32,
    pub flow_type: FlowType,
    pub flow_status: FlowStatus,
    pub token_mint: Pubkey,          // Token mint 
    #[max_len(3)]
    pub rules: Vec<RuleType>,
    #[max_len(3)]
    pub voting_mechanisms: Vec<VotingMechanism>,
    pub bump: u8
}