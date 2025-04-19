use anchor_lang::prelude::*;

use crate::errors::TitaErrors;


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum ProposalType {
    MilestoneCompletion {
        milestone_id: u32,
    },
    // FundRelease {
    //     amount: u64,
    //     recipient: Pubkey,
    // },
    FlowCancellation,
    MilestoneAdjustment {
        milestone_id: u32,
        new_amount: Option<u64>,
        new_deadline: Option<i64>,
    },
    FlowFundingExtension {
        new_end_date: i64,
    },
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, InitSpace)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Executed,
    Canceled
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum VoteType {
    For,
    Against,
    Abstain,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub flow: Pubkey,                // The flow this proposal belongs to
    pub proposer: Pubkey,            // Account that created the proposal
    pub proposal_type: ProposalType, // What type of action this proposal represents
    pub status: ProposalStatus,      // Current status of the proposal
    pub created_at: i64,             // When the proposal was created
    pub voting_starts_at: i64,       // When voting begins
    pub voting_ends_at: i64,         // When voting ends
    pub votes_for: u64,              // Total votes in favor
    pub votes_against: u64,          // Total votes against
    pub votes_abstain: u64,          // Total abstained votes
    pub total_eligible_votes: u64,   // Total possible votes (sum of all contributions)
    pub executed_at: Option<i64>,    // When the proposal was executed, if applicable
    pub quorum_percentage: u16,      // Required participation as percentage (basis points)
    pub approval_percentage: u16,    // Required approval as percentage (basis points)
    pub last_vote_check: i64,        // Timestamp of last threshold check
    pub bump: u8,
}


impl Proposal {
    pub fn is_active(&self) -> bool {
        if self.status != ProposalStatus::Active {
            return false;
        }
        
        let current_time = Clock::get().unwrap().unix_timestamp;
        current_time >= self.voting_starts_at && current_time <= self.voting_ends_at
    }
    
    pub fn can_vote(&self, current_time: i64) -> bool {
        self.status == ProposalStatus::Active && 
        current_time >= self.voting_starts_at && 
        current_time <= self.voting_ends_at
    }
    
    pub fn can_execute(&self) -> bool {
        if self.status != ProposalStatus::Passed {
            return false;
        }
        
        let current_time = Clock::get().unwrap().unix_timestamp;
        current_time > self.voting_ends_at
    }
    
    pub fn update_status(&mut self) -> Result<()> {
        // Only update if still active
        if self.status != ProposalStatus::Active {
            return Ok(());
        }
        
        let current_time = Clock::get()?.unix_timestamp;
        
        // Check if voting period is over
        if current_time > self.voting_ends_at {
            // Check quorum
            let total_votes = self.votes_for + self.votes_against + self.votes_abstain;
            let quorum_threshold = self.total_eligible_votes
                .checked_mul(self.quorum_percentage as u64)
                .ok_or(ProgramError::ArithmeticOverflow)?
                .checked_div(10000)
                .ok_or(ProgramError::ArithmeticOverflow)?;
                
            if total_votes < quorum_threshold {
                self.status = ProposalStatus::Failed;
                return Ok(());
            }
            
            // Check approval threshold
            let approval_threshold = total_votes
                .checked_mul(self.approval_percentage as u64)
                .ok_or(ProgramError::ArithmeticOverflow)?
                .checked_div(10000)
                .ok_or(ProgramError::ArithmeticOverflow)?;
                
            if self.votes_for >= approval_threshold {
                self.status = ProposalStatus::Passed;
            } else {
                self.status = ProposalStatus::Failed;
            }
        }
        
        Ok(())
    }
    
    pub fn add_vote(&mut self, vote_type: VoteType, voting_power: u64) -> Result<()> {
        // Ensure voting is active
        require!(self.is_active(), TitaErrors::VotingNotActive);
        
        // Update vote counts
        match vote_type {
            VoteType::For => {
                self.votes_for = self.votes_for
                    .checked_add(voting_power)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            },
            VoteType::Against => {
                self.votes_against = self.votes_against
                    .checked_add(voting_power)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            },
            VoteType::Abstain => {
                self.votes_abstain = self.votes_abstain
                    .checked_add(voting_power)
                    .ok_or(ProgramError::ArithmeticOverflow)?;
            }
        }
        
        Ok(())
    }
    
    pub fn cancel(&mut self, canceler: &Pubkey) -> Result<()> {
        // Only proposer can cancel, or if in Draft status
        require!(
            *canceler == self.proposer,
            TitaErrors::UnauthorizedCancellation
        );
        
        // Can't cancel if already executed
        require!(
            self.status != ProposalStatus::Executed,
            TitaErrors::ProposalAlreadyExecuted
        );
        
        self.status = ProposalStatus::Canceled;
        
        Ok(())
    }
    
    // Check if thresholds are met for auto-execution
    pub fn check_execution_threshold(&mut self) -> Result<bool> {
        // Return early if not active
        if self.status != ProposalStatus::Active {
            return Ok(false);
        }
        
        // Calculate vote totals
        let total_votes = self.votes_for + self.votes_against + self.votes_abstain;
        
        // Check quorum
        let quorum_threshold = self.total_eligible_votes
            .checked_mul(self.quorum_percentage as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(ProgramError::ArithmeticOverflow)?;
            
        if total_votes < quorum_threshold {
            // Not enough votes yet
            return Ok(false);
        }
        
        // Check approval threshold
        let approval_threshold = total_votes
            .checked_mul(self.approval_percentage as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(ProgramError::ArithmeticOverflow)?;
            
        let should_execute = self.votes_for >= approval_threshold;
        
        // Update status if passed
        if should_execute {
            self.status = ProposalStatus::Passed;
        }
        
        // Update last check time
        self.last_vote_check = Clock::get()?.unix_timestamp;
        
        Ok(should_execute)
    }
}