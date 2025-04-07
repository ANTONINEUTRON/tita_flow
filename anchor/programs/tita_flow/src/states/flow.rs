use std::mem::discriminant;

use anchor_lang::prelude::*;

use super::{Vault, VaultType, VotingMechanism};

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
    pub flow_id: String,         // Unique identifier
    pub creator: Pubkey,         // Flow creator
    pub token_mint: Pubkey,      // Token being used
    pub goal: u64,               // Target amount
    pub raised: u64,             // Total raised so far
    pub start_date: Option<i64>, // When flow starts
    pub end_date: Option<i64>,   // When flow ends
    pub flow_status: FlowStatus, // Active/Completed/Canceled
    pub contributor_count: u32,  // Number of contributors
    pub primary_vault: Pubkey,   // Primary vault (always exists)
    pub bump: u8
}

impl Flow {
    pub fn get_flow_type(&self, vaults: Vec<&Vault>) -> RuleType {
        if vaults.len() == 1 {
            return RuleType::Direct;
        }
        
        let has_milestones = vaults.iter().any(|v| 
            matches!(v.vault_type, VaultType::Milestone)
        );
        
        let has_weighted = vaults.iter().any(|v| 
            matches!(v.vault_type, VaultType::Weighted)
        );
        
        if has_milestones {
            RuleType::Milestone
        } else if has_weighted {
            RuleType::Weighted
        } else {
            RuleType::Direct // Default
        }
    }
}
