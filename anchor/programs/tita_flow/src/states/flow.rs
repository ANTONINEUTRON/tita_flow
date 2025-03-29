use anchor_lang::prelude::*;

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum VotingMechanism {
    ContributionWeighted,
    Futarchy,
    Quadratic,
}


#[account]
#[derive(InitSpace)]
pub struct Flow {
    pub flow_id: u32,
    pub creator: Pubkey,
    pub goal: u64,                   // Target amount
    pub raised: u64,                 // Current raised amount
    pub token_mint: Pubkey,          // Token mint
    pub start_time: i64,             // Start timestamp
    pub end_time: i64,  
    pub contributor_count: u32,      // Number of contributors
    pub milestone_count: u32,        // Number of milestones
    pub proposal_count: u32,
    pub flow_type: FlowType,
    pub flow_status: FlowStatus, 
    #[max_len(3)]
    pub rules: Vec<RuleType>,
    #[max_len(3)]
    pub voting_mechanisms: Vec<VotingMechanism>
}