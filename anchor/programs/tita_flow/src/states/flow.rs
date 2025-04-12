use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum FlowStatus {
    Active,
    Completed,
    Canceled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Milestone {
    pub id: u32,               // Unique identifier for the milestone
    pub amount: u64,            // Amount allocated to this milestone
    pub deadline: i64,          // When this milestone is due
    pub completed: bool,        // Whether the milestone is completed
}

#[account]
#[derive(InitSpace)]
pub struct Flow {
    #[max_len(32)]
    pub flow_id: String,         // Unique identifier
    pub creator: Pubkey,         // Flow creator
    pub token_mint: Pubkey,      // Token being used
    pub goal: u64,               // Target amount
    pub raised: u64,             // Total raised so far
    pub start_date: Option<i64>, // When flow starts
    pub end_date: Option<i64>,   // When flow ends
    pub flow_status: FlowStatus, // Active/Completed/Canceled
    pub contributor_count: u32,  // Number of contributors
    #[max_len(10)]              // Maximum 10 milestones
    pub milestones: Option<Vec<Milestone>>, // Milestone data (only used if flow_type is Milestone)
    pub bump: u8
}