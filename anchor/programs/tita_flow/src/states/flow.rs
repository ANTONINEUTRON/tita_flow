use std::mem::discriminant;

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

impl Flow {
    /// Check if the flow has a specific rule type
    pub fn has_rule(&self, rule_type: RuleType) -> bool {
        // Iterate through the rules and check for a match
        for rule in &self.rules {
            if discriminant(rule) == discriminant(&rule_type) {
                return true;
            }
        }
        false
    }
    
    /// Helper method to check if flow has direct rule
    pub fn has_direct_rule(&self) -> bool {
        self.has_rule(RuleType::Direct)
    }
    
    /// Helper method to check if flow has milestone rule
    pub fn has_milestone_rule(&self) -> bool {
        self.has_rule(RuleType::Milestone)
    }
    
    /// Helper method to check if flow has weighted rule
    pub fn has_weighted_rule(&self) -> bool {
        self.has_rule(RuleType::Weighted)
    }
    
    /// Get the remaining time for the flow in seconds
    /// Returns None if no end date is set or if the flow has already ended
    pub fn get_remaining_time(&self, current_timestamp: i64) -> Option<i64> {
        if let Some(end) = self.end_date {
            if end > current_timestamp {
                return Some(end - current_timestamp);
            }
        }
        None
    }
    
    /// Check if the flow has ended based on its end date
    pub fn has_ended(&self, current_timestamp: i64) -> bool {
        if let Some(end) = self.end_date {
            return current_timestamp >= end;
        }
        false
    }
    
    /// Check if the flow has reached its goal
    pub fn goal_reached(&self) -> bool {
        self.raised >= self.goal
    }
    
    /// Get the percentage of goal completion (0-100)
    pub fn get_completion_percentage(&self) -> u8 {
        if self.goal == 0 {
            return 0;
        }
        
        let percentage = (self.raised as u128)
            .saturating_mul(100)
            .saturating_div(self.goal as u128);
            
        // Cap at 100%
        std::cmp::min(percentage as u8, 100)
    }
}
